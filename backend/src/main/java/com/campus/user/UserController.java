package com.campus.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
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
import com.campus.user.dto.RegisterRequest;
import com.campus.user.dto.UpdateRoleRequest;

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
