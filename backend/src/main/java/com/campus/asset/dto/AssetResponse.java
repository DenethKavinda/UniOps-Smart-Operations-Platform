package com.campus.asset.dto;

import java.time.LocalDateTime;

public class AssetResponse {

    private Long id;
    private String name;
    private String status;
    private LocalDateTime createdAt;

    public AssetResponse(Long id, String name, String status, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
