package com.campus.user.dto;

import java.time.LocalDateTime;

import com.campus.user.UserRole;

public class UserDirectoryResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private boolean blocked;
    private int loginCount;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private String profileImageUrl;
    private String address;
    private String mobileNumber;
    private String department;
    private String bio;

    public UserDirectoryResponse() {
    }

    public UserDirectoryResponse(Long id, String name, String email, UserRole role, boolean blocked, int loginCount,
            LocalDateTime lastLoginAt, LocalDateTime createdAt, String profileImageUrl, String address,
            String mobileNumber, String department, String bio) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.blocked = blocked;
        this.loginCount = loginCount;
        this.lastLoginAt = lastLoginAt;
        this.createdAt = createdAt;
        this.profileImageUrl = profileImageUrl;
        this.address = address;
        this.mobileNumber = mobileNumber;
        this.department = department;
        this.bio = bio;
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

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
