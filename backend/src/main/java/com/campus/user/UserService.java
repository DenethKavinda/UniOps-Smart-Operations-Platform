package com.campus.user;

import com.campus.user.dto.AuthRequest;
import com.campus.user.dto.AuthResponse;
import com.campus.user.dto.RegisterRequest;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);
}
