package com.campus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateBookingRequest {

    private Long resourceId;
    private String resourceName;
    private String title;
    private String requestedBy;
    private String requestedByEmail;
    private String purpose;
    private Integer expectedAttendees;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    public CreateBookingRequest() {
    }

    public CreateBookingRequest(Long resourceId, String resourceName, String title, String requestedBy,
            String requestedByEmail, String purpose, Integer expectedAttendees, LocalDate bookingDate,
            LocalTime startTime, LocalTime endTime) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.title = title;
        this.requestedBy = requestedBy;
        this.requestedByEmail = requestedByEmail;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public String getRequestedByEmail() {
        return requestedByEmail;
    }

    public void setRequestedByEmail(String requestedByEmail) {
        this.requestedByEmail = requestedByEmail;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
