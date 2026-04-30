package com.campus.facility.dto;

public class FacilityRequest {

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private Boolean hasProjector;
    private Boolean hasCamera;
    private String status;

    public FacilityRequest() {
    }

    public FacilityRequest(String name, String type, Integer capacity, String location,
            Boolean hasProjector, Boolean hasCamera, String status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.hasProjector = hasProjector;
        this.hasCamera = hasCamera;
        this.status = status;
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
}
