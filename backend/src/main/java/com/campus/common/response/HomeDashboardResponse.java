package com.campus.common.response;

import java.time.LocalDateTime;
import java.util.List;

public class HomeDashboardResponse {

    private long totalResources;
    private long activeBookings;
    private long pendingBookings;
    private long openTickets;
    private long inProgressTickets;
    private long highPriorityTickets;
    private long availableResources;
    private long busyResources;
    private List<HomeActivityResponse> recentActivities;

    public HomeDashboardResponse() {
    }

    public HomeDashboardResponse(long totalResources, long activeBookings, long pendingBookings, long openTickets,
            long inProgressTickets, long highPriorityTickets, long availableResources, long busyResources,
            List<HomeActivityResponse> recentActivities) {
        this.totalResources = totalResources;
        this.activeBookings = activeBookings;
        this.pendingBookings = pendingBookings;
        this.openTickets = openTickets;
        this.inProgressTickets = inProgressTickets;
        this.highPriorityTickets = highPriorityTickets;
        this.availableResources = availableResources;
        this.busyResources = busyResources;
        this.recentActivities = recentActivities;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getOpenTickets() {
        return openTickets;
    }

    public void setOpenTickets(long openTickets) {
        this.openTickets = openTickets;
    }

    public long getInProgressTickets() {
        return inProgressTickets;
    }

    public void setInProgressTickets(long inProgressTickets) {
        this.inProgressTickets = inProgressTickets;
    }

    public long getHighPriorityTickets() {
        return highPriorityTickets;
    }

    public void setHighPriorityTickets(long highPriorityTickets) {
        this.highPriorityTickets = highPriorityTickets;
    }

    public long getAvailableResources() {
        return availableResources;
    }

    public void setAvailableResources(long availableResources) {
        this.availableResources = availableResources;
    }

    public long getBusyResources() {
        return busyResources;
    }

    public void setBusyResources(long busyResources) {
        this.busyResources = busyResources;
    }

    public List<HomeActivityResponse> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<HomeActivityResponse> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public static class HomeActivityResponse {

        private String kind;
        private String title;
        private String detail;
        private LocalDateTime createdAt;

        public HomeActivityResponse() {
        }

        public HomeActivityResponse(String kind, String title, String detail, LocalDateTime createdAt) {
            this.kind = kind;
            this.title = title;
            this.detail = detail;
            this.createdAt = createdAt;
        }

        public String getKind() {
            return kind;
        }

        public void setKind(String kind) {
            this.kind = kind;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDetail() {
            return detail;
        }

        public void setDetail(String detail) {
            this.detail = detail;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
