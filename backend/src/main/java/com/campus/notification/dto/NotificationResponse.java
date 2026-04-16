package com.campus.notification.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String linkUrl;
    private String linkLabel;
    private String documentUrl;
    private boolean hasDocument;
    private String documentName;
    private String documentContentType;
    private String createdBy;
    private LocalDateTime createdAt;

    public NotificationResponse(Long id, String title, String message, String linkUrl, String linkLabel,
            String documentUrl, boolean hasDocument, String documentName, String documentContentType,
            String createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.linkUrl = linkUrl;
        this.linkLabel = linkLabel;
        this.documentUrl = documentUrl;
        this.hasDocument = hasDocument;
        this.documentName = documentName;
        this.documentContentType = documentContentType;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getLinkLabel() {
        return linkLabel;
    }

    public void setLinkLabel(String linkLabel) {
        this.linkLabel = linkLabel;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public boolean isHasDocument() {
        return hasDocument;
    }

    public void setHasDocument(boolean hasDocument) {
        this.hasDocument = hasDocument;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentContentType() {
        return documentContentType;
    }

    public void setDocumentContentType(String documentContentType) {
        this.documentContentType = documentContentType;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
