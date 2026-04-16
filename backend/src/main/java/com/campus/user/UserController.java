package com.campus.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campus.common.response.ApiResponse;
import com.campus.user.dto.AdminDashboardResponse;
import com.campus.user.dto.AdminUserResponse;
import com.campus.user.dto.AuthRequest;
import com.campus.user.dto.AuthResponse;
import com.campus.user.dto.ChangePasswordRequest;
import com.campus.user.dto.GoogleAuthRequest;
import com.campus.user.dto.RegisterRequest;
import com.campus.user.dto.ResetPasswordRequest;
import com.campus.user.dto.UpdateProfileRequest;
import com.campus.user.dto.UpdateRoleRequest;
import com.campus.user.dto.UserProfileResponse;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully.", response));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful.", response));
    }

    @PostMapping("/auth/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody GoogleAuthRequest request) {
        AuthResponse response = userService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Google login successful.", response));
    }

    @GetMapping("/auth/google-client-id")
    public ResponseEntity<ApiResponse<String>> googleClientId() {
        return ResponseEntity.ok(ApiResponse.success("Google client ID loaded successfully.",
                userService.getGoogleClientId()));
    }

    @PostMapping("/auth/password-reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully.", null));
    }

    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Profile loaded successfully.", userService.getUserProfile(userId)));
    }

    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@PathVariable Long userId,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.",
                userService.updateUserProfile(userId, request)));
    }

    @PutMapping("/users/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable Long userId,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully.", null));
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard loaded successfully.",
                userService.getDashboardOverview()));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.success("Users loaded successfully.", userService.getAllUsers()));
    }

    @PutMapping("/admin/users/{userId}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(@PathVariable Long userId,
            @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully.",
                userService.updateUserRole(userId, request)));
    }

    @PutMapping("/admin/users/{userId}/block")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateBlockStatus(@PathVariable Long userId,
            @RequestBody UpdateBlockRequest request) {
        boolean blocked = request != null && request.isBlocked();
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully.",
                userService.updateUserBlockStatus(userId, blocked)));
    }

    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User removed successfully.", null));
    }

    public static class UpdateBlockRequest {

        private boolean blocked;

        public boolean isBlocked() {
            return blocked;
        }

        public void setBlocked(boolean blocked) {
            this.blocked = blocked;
        }
    }
}
