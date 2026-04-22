package com.campus.user;

import java.util.List;

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
import com.campus.user.dto.UserDirectoryResponse;
import com.campus.user.dto.UserProfileResponse;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);

    AuthResponse loginWithGoogle(GoogleAuthRequest request);

    String getGoogleClientId();

    AdminDashboardResponse getDashboardOverview();

    List<AdminUserResponse> getAllUsers();

    List<UserDirectoryResponse> getUserDirectory();

    AdminUserResponse updateUserRole(Long userId, UpdateRoleRequest request);

    AdminUserResponse updateUserBlockStatus(Long userId, boolean blocked);

    void deleteUser(Long userId);

    UserProfileResponse getUserProfile(Long userId);

    UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
