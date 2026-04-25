package com.campus.asset.dto;

import java.time.LocalDateTime;

public class AssetAvailabilityWindowResponse {

    private Long id;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public AssetAvailabilityWindowResponse() {
    }

    public AssetAvailabilityWindowResponse(Long id, LocalDateTime startAt, LocalDateTime endAt) {
        this.id = id;
        this.startAt = startAt;
        this.endAt = endAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }
}
