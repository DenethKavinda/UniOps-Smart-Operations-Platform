package com.campus.user.dto;

import com.campus.user.UserRole;

public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String profileImageUrl;
    private String address;
    private String mobileNumber;
    private String department;
    private String bio;
    private int profileCompletion;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String name, String email, UserRole role, String profileImageUrl, String address,
            String mobileNumber, String department, String bio, int profileCompletion) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.address = address;
        this.mobileNumber = mobileNumber;
        this.department = department;
        this.bio = bio;
        this.profileCompletion = profileCompletion;
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

    public int getProfileCompletion() {
        return profileCompletion;
    }

    public void setProfileCompletion(int profileCompletion) {
        this.profileCompletion = profileCompletion;
    }
}
