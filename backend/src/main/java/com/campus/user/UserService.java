package com.campus.user;

import java.util.List;

import com.campus.user.dto.AdminDashboardResponse;
import com.campus.user.dto.AdminUserResponse;
import com.campus.user.dto.AuthRequest;
import com.campus.user.dto.AuthResponse;
import com.campus.user.dto.RegisterRequest;
import com.campus.user.dto.UpdateRoleRequest;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);

    AdminDashboardResponse getDashboardOverview();

    List<AdminUserResponse> getAllUsers();

    AdminUserResponse updateUserRole(Long userId, UpdateRoleRequest request);

    AdminUserResponse updateUserBlockStatus(Long userId, boolean blocked);
}
