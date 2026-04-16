package com.campus.user.dto;

import java.util.List;

public class AdminDashboardResponse {

    private long totalUsers;
    private long adminUsers;
    private long studentUsers;
    private long blockedUsers;
    private int totalLogins;
    private long bookingCount;
    private long maintenanceCount;
    private long assetCount;
    private List<RoleStatsResponse> roleStats;
    private List<LoginChartPointResponse> loginChart;
    private List<AdminUserResponse> users;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalUsers, long adminUsers, long studentUsers, long blockedUsers,
            int totalLogins, long bookingCount, long maintenanceCount, long assetCount,
            List<RoleStatsResponse> roleStats, List<LoginChartPointResponse> loginChart,
            List<AdminUserResponse> users) {
        this.totalUsers = totalUsers;
        this.adminUsers = adminUsers;
        this.studentUsers = studentUsers;
        this.blockedUsers = blockedUsers;
        this.totalLogins = totalLogins;
        this.bookingCount = bookingCount;
        this.maintenanceCount = maintenanceCount;
        this.assetCount = assetCount;
        this.roleStats = roleStats;
        this.loginChart = loginChart;
        this.users = users;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getAdminUsers() {
        return adminUsers;
    }

    public void setAdminUsers(long adminUsers) {
        this.adminUsers = adminUsers;
    }

    public long getStudentUsers() {
        return studentUsers;
    }

    public void setStudentUsers(long studentUsers) {
        this.studentUsers = studentUsers;
    }

    public long getBlockedUsers() {
        return blockedUsers;
    }

    public void setBlockedUsers(long blockedUsers) {
        this.blockedUsers = blockedUsers;
    }

    public int getTotalLogins() {
        return totalLogins;
    }

    public void setTotalLogins(int totalLogins) {
        this.totalLogins = totalLogins;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public long getMaintenanceCount() {
        return maintenanceCount;
    }

    public void setMaintenanceCount(long maintenanceCount) {
        this.maintenanceCount = maintenanceCount;
    }

    public long getAssetCount() {
        return assetCount;
    }

    public void setAssetCount(long assetCount) {
        this.assetCount = assetCount;
    }

    public List<RoleStatsResponse> getRoleStats() {
        return roleStats;
    }

    public void setRoleStats(List<RoleStatsResponse> roleStats) {
        this.roleStats = roleStats;
    }

    public List<LoginChartPointResponse> getLoginChart() {
        return loginChart;
    }

    public void setLoginChart(List<LoginChartPointResponse> loginChart) {
        this.loginChart = loginChart;
    }

    public List<AdminUserResponse> getUsers() {
        return users;
    }

    public void setUsers(List<AdminUserResponse> users) {
        this.users = users;
    }
}
