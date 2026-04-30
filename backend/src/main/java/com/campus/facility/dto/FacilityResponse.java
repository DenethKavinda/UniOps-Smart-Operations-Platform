package com.campus.facility.dto;

import java.time.LocalDateTime;

public class FacilityResponse {

    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private Boolean hasProjector;
    private Boolean hasCamera;
    private String status;
    private Boolean availableNow;
    private LocalDateTime createdAt;

    public FacilityResponse(Long id, String name, String type, Integer capacity, String location,
            Boolean hasProjector, Boolean hasCamera, String status, Boolean availableNow,
            LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.hasProjector = hasProjector;
        this.hasCamera = hasCamera;
        this.status = status;
        this.availableNow = availableNow;
        this.createdAt = createdAt;
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

    public Boolean getHasProjector() {
        return hasProjector;
    }

    public void setHasProjector(Boolean hasProjector) {
        this.hasProjector = hasProjector;
    }

    public Boolean getHasCamera() {
        return hasCamera;
    }

    public void setHasCamera(Boolean hasCamera) {
        this.hasCamera = hasCamera;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAvailableNow() {
        return availableNow;
    }

    public void setAvailableNow(Boolean availableNow) {
        this.availableNow = availableNow;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
