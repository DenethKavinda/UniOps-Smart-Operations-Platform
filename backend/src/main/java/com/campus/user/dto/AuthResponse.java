package com.campus.user.dto;

import com.campus.user.UserRole;

public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private boolean blocked;
    private int loginCount;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String name, String email, UserRole role, boolean blocked, int loginCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.blocked = blocked;
        this.loginCount = loginCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public int getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(int loginCount) {
        this.loginCount = loginCount;
    }
}
