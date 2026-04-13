package com.campus.user;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campus.asset.AssetRepository;
import com.campus.booking.BookingRepository;
import com.campus.common.exception.ResourceNotFoundException;
import com.campus.maintenance.MaintenanceRepository;
import com.campus.user.dto.AdminDashboardResponse;
import com.campus.user.dto.AdminUserResponse;
import com.campus.user.dto.AuthRequest;
import com.campus.user.dto.AuthResponse;
import com.campus.user.dto.LoginChartPointResponse;
import com.campus.user.dto.RegisterRequest;
import com.campus.user.dto.RoleStatsResponse;
import com.campus.user.dto.UpdateRoleRequest;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository, AssetRepository assetRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
        this.passwordEncoder = passwordEncoder;
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
                bookingRepository.count(), maintenanceRepository.count(), assetRepository.count(), roleStats,
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

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isBlocked(),
                user.getLoginCount());
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isBlocked(),
                user.getLoginCount(), user.getLastLoginAt(), user.getCreatedAt());
    }

    private LoginChartPointResponse toLoginChartPoint(User user) {
        return new LoginChartPointResponse(user.getId(), user.getName(), user.getEmail(), user.getLoginCount());
    }

    private double percentage(long count, long total) {
        if (total == 0) {
            return 0;
        }
        return Math.round((count * 1000.0 / total)) / 10.0;
    }
}
