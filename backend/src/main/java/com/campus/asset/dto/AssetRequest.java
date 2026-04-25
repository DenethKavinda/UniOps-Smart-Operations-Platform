package com.campus.asset.dto;

import java.util.List;

public class AssetRequest {

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private List<AssetAvailabilityWindowRequest> availabilityWindows;

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

    public List<AssetAvailabilityWindowRequest> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<AssetAvailabilityWindowRequest> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
}
