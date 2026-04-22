package com.campus.user;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campus.asset.AssetRepository;
import com.campus.booking.BookingRepository;
import com.campus.common.exception.ResourceNotFoundException;
import com.campus.incident.IncidentTicketRepository;
import com.campus.user.dto.AdminDashboardResponse;
import com.campus.user.dto.AdminUserResponse;
import com.campus.user.dto.AuthRequest;
import com.campus.user.dto.AuthResponse;
import com.campus.user.dto.ChangePasswordRequest;
import com.campus.user.dto.GoogleAuthRequest;
import com.campus.user.dto.LoginChartPointResponse;
import com.campus.user.dto.RegisterRequest;
import com.campus.user.dto.ResetPasswordRequest;
import com.campus.user.dto.RoleStatsResponse;
import com.campus.user.dto.UpdateProfileRequest;
import com.campus.user.dto.UpdateRoleRequest;
import com.campus.user.dto.UserDirectoryResponse;
import com.campus.user.dto.UserProfileResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final String googleClientId;

    public UserServiceImpl(UserRepository userRepository, BookingRepository bookingRepository,
            IncidentTicketRepository incidentTicketRepository, AssetRepository assetRepository,
            PasswordEncoder passwordEncoder, @Value("${google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.incidentTicketRepository = incidentTicketRepository;
        this.assetRepository = assetRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
        this.googleIdTokenVerifier = buildGoogleVerifier(googleClientId);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
        user.setBlocked(false);
        user.setLoginCount(0);

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (user.isBlocked()) {
            throw new IllegalArgumentException("This account is blocked. Contact an administrator.");
        }

        user.setLoginCount(user.getLoginCount() + 1);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return toAuthResponse(user);
    }

    @Override
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new IllegalArgumentException("Google token is required.");
        }
        if (googleIdTokenVerifier == null) {
            throw new IllegalStateException("Google login is not configured.");
        }

        GoogleIdToken idToken;
        try {
            idToken = googleIdTokenVerifier.verify(request.getIdToken().trim());
        } catch (GeneralSecurityException | IOException ex) {
            throw new IllegalArgumentException("Unable to verify Google token.");
        }

        if (idToken == null) {
            throw new IllegalArgumentException("Invalid Google token.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email is missing.");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElseGet(User::new);
        boolean isNewUser = user.getId() == null;

        if (isNewUser) {
            user.setBlocked(false);
            user.setLoginCount(0);
            user.setRole(UserRole.STUDENT);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(normalize(payload.get("name") != null ? payload.get("name").toString() : null));
        }
        if (user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank()) {
            Object picture = payload.get("picture");
            if (picture != null) {
                user.setProfileImageUrl(normalize(picture.toString()));
            }
        }

        user.setEmail(email.trim().toLowerCase());
        user.setLastLoginAt(LocalDateTime.now());
        user.setLoginCount(user.getLoginCount() + 1);

        return toAuthResponse(userRepository.save(user));
    }

    @Override
    public String getGoogleClientId() {
        return googleClientId;
    }

    @Override
    public AdminDashboardResponse getDashboardOverview() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long adminUsers = userRepository.countByRole(UserRole.ADMIN);
        long studentUsers = userRepository.countByRole(UserRole.STUDENT);
        long blockedUsers = userRepository.countByBlockedTrue();
        int totalLogins = users.stream().mapToInt(User::getLoginCount).sum();

        List<RoleStatsResponse> roleStats = List.of(
                new RoleStatsResponse(UserRole.ADMIN.name(), adminUsers, percentage(adminUsers, totalUsers)),
                new RoleStatsResponse(UserRole.STUDENT.name(), studentUsers, percentage(studentUsers, totalUsers)));

        List<LoginChartPointResponse> loginChart = users.stream()
                .sorted(Comparator.comparingInt(User::getLoginCount).reversed().thenComparing(User::getName))
                .limit(8)
                .map(this::toLoginChartPoint)
                .collect(Collectors.toList());

        return new AdminDashboardResponse(totalUsers, adminUsers, studentUsers, blockedUsers, totalLogins,
                bookingRepository.count(), incidentTicketRepository.count(), assetRepository.count(), roleStats,
                loginChart, getAllUsers());
    }

    @Override
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDirectoryResponse> getUserDirectory() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toUserDirectoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse updateUserRole(Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (request == null || request.getRole() == null || request.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Role must be ADMIN or STUDENT.");
        }

        user.setRole(role);
        return toAdminUserResponse(userRepository.save(user));
    }

    @Override
    public AdminUserResponse updateUserBlockStatus(Long userId, boolean blocked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        user.setBlocked(blocked);
        return toAdminUserResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        userRepository.delete(user);
    }

    @Override
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return toUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (request == null) {
            throw new IllegalArgumentException("Profile details are required.");
        }

        String name = normalize(request.getName());
        if (name == null) {
            throw new IllegalArgumentException("Name is required.");
        }

        user.setName(name);
        user.setProfileImageUrl(normalize(request.getProfileImageUrl()));
        user.setAddress(normalize(request.getAddress()));
        user.setMobileNumber(normalize(request.getMobileNumber()));
        user.setDepartment(normalize(request.getDepartment()));
        user.setBio(normalize(request.getBio()));

        return toUserProfileResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (request == null || request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        validateNewPassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Reset details are required.");
        }

        String name = normalize(request.getName());
        String email = normalizeEmail(request.getEmail());
        if (name == null) {
            throw new IllegalArgumentException("User name is required.");
        }
        if (email == null) {
            throw new IllegalArgumentException("Email is required.");
        }
        validateNewPassword(request.getNewPassword());

        User user = userRepository.findByNameIgnoreCaseAndEmail(name, email)
                .orElseThrow(() -> new IllegalArgumentException("User name and email do not match."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isBlocked(),
                user.getLoginCount(), user.getProfileImageUrl(), user.getAddress(), user.getMobileNumber(),
                user.getDepartment(), user.getBio());
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isBlocked(),
                user.getLoginCount(), user.getLastLoginAt(), user.getCreatedAt());
    }

    private UserDirectoryResponse toUserDirectoryResponse(User user) {
        return new UserDirectoryResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isBlocked(), user.getLoginCount(), user.getLastLoginAt(), user.getCreatedAt(),
                user.getProfileImageUrl(), user.getAddress(), user.getMobileNumber(), user.getDepartment(),
                user.getBio());
    }

    private LoginChartPointResponse toLoginChartPoint(User user) {
        return new LoginChartPointResponse(user.getId(), user.getName(), user.getEmail(), user.getLoginCount());
    }

    private UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.getProfileImageUrl(), user.getAddress(), user.getMobileNumber(), user.getDepartment(),
                user.getBio(), calculateProfileCompletion(user));
    }

    private int calculateProfileCompletion(User user) {
        int totalFields = 7;
        int completed = 0;

        if (normalize(user.getName()) != null) {
            completed++;
        }
        if (normalizeEmail(user.getEmail()) != null) {
            completed++;
        }
        if (normalize(user.getProfileImageUrl()) != null) {
            completed++;
        }
        if (normalize(user.getAddress()) != null) {
            completed++;
        }
        if (normalize(user.getMobileNumber()) != null) {
            completed++;
        }
        if (normalize(user.getDepartment()) != null) {
            completed++;
        }
        if (normalize(user.getBio()) != null) {
            completed++;
        }

        return (int) Math.round((completed * 100.0) / totalFields);
    }

    private void validateNewPassword(String password) {
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeEmail(String email) {
        String normalized = normalize(email);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private GoogleIdTokenVerifier buildGoogleVerifier(String googleClientId) {
        if (googleClientId == null || googleClientId.isBlank()) {
            return null;
        }

        try {
            return new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();
        } catch (GeneralSecurityException | IOException ex) {
            throw new IllegalStateException("Unable to initialize Google token verifier.", ex);
        }
    }

    private double percentage(long count, long total) {
        if (total == 0) {
            return 0;
        }
        return Math.round((count * 1000.0 / total)) / 10.0;
    }
}
