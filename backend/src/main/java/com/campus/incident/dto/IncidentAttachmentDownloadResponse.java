package com.campus.incident.dto;

public class IncidentAttachmentDownloadResponse {

    private byte[] data;
    private String fileName;
    private String contentType;

    public IncidentAttachmentDownloadResponse(byte[] data, String fileName, String contentType) {
        this.data = data;
        this.fileName = fileName;
        this.contentType = contentType;
    }

    public byte[] getData() {
        return data;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }
}
