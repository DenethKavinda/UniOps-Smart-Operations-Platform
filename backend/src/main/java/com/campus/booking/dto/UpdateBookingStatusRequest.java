package com.campus.booking.dto;

public class UpdateBookingStatusRequest {

    private String status;
    private String adminNote;

    public UpdateBookingStatusRequest() {
    }

    public UpdateBookingStatusRequest(String status, String adminNote) {
        this.status = status;
        this.adminNote = adminNote;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
