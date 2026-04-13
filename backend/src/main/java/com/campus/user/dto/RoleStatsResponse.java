package com.campus.user.dto;

public class RoleStatsResponse {

    private String role;
    private long count;
    private double percentage;

    public RoleStatsResponse() {
    }

    public RoleStatsResponse(String role, long count, double percentage) {
        this.role = role;
        this.count = count;
        this.percentage = percentage;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
