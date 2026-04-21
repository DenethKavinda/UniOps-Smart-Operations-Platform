package com.campus.asset.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AssetResponse {

    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private boolean availableNow;
    private LocalDateTime createdAt;
    private List<AssetAvailabilityWindowResponse> availabilityWindows;

    public AssetResponse() {
    }

    public AssetResponse(Long id, String name, String type, Integer capacity, String location, String status,
            boolean availableNow, LocalDateTime createdAt, List<AssetAvailabilityWindowResponse> availabilityWindows) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.availableNow = availableNow;
        this.createdAt = createdAt;
        this.availabilityWindows = availabilityWindows;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isAvailableNow() {
        return availableNow;
    }

    public void setAvailableNow(boolean availableNow) {
        this.availableNow = availableNow;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<AssetAvailabilityWindowResponse> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<AssetAvailabilityWindowResponse> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
}
