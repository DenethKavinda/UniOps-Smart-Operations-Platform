package com.campus.incident.dto;

import com.campus.incident.IncidentPriority;

public class CreateIncidentRequest {

    private Long resourceId;
    private String resourceName;
    private String location;
    private String category;
    private String description;
    private IncidentPriority priority;
    private String createdByName;
    private String createdByEmail;
    private String preferredContactName;
    private String preferredContactEmail;
    private String preferredContactPhone;

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IncidentPriority getPriority() {
        return priority;
    }

    public void setPriority(IncidentPriority priority) {
        this.priority = priority;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }

    public String getPreferredContactName() {
        return preferredContactName;
    }

    public void setPreferredContactName(String preferredContactName) {
        this.preferredContactName = preferredContactName;
    }

    public String getPreferredContactEmail() {
        return preferredContactEmail;
    }

    public void setPreferredContactEmail(String preferredContactEmail) {
        this.preferredContactEmail = preferredContactEmail;
    }

    public String getPreferredContactPhone() {
        return preferredContactPhone;
    }

    public void setPreferredContactPhone(String preferredContactPhone) {
        this.preferredContactPhone = preferredContactPhone;
    }
}
