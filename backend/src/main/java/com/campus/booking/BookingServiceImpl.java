package com.campus.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campus.booking.dto.BookingResponse;
import com.campus.booking.dto.CreateBookingRequest;
import com.campus.booking.dto.UpdateBookingStatusRequest;
import com.campus.common.exception.ResourceNotFoundException;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        // Validate required fields
        if (request.getResourceId() == null || request.getResourceName() == null
                || request.getResourceName().isBlank()) {
            throw new IllegalArgumentException("Resource information is required. Please select a valid resource.");
        }
        if (request.getRequestedBy() == null || request.getRequestedBy().isBlank()) {
            throw new IllegalArgumentException("Your name is required to create a booking.");
        }
        if (request.getRequestedByEmail() == null || request.getRequestedByEmail().isBlank()) {
            throw new IllegalArgumentException("Your email address is required to create a booking.");
        }
        if (request.getPurpose() == null || request.getPurpose().isBlank()) {
            throw new IllegalArgumentException("Please describe the purpose of your booking.");
        }
        if (request.getBookingDate() == null) {
            throw new IllegalArgumentException("Please select a booking date.");
        }
        if (request.getStartTime() == null) {
            throw new IllegalArgumentException("Please select a start time for your booking.");
        }
        if (request.getEndTime() == null) {
            throw new IllegalArgumentException("Please select an end time for your booking.");
        }

        // Validate endTime is after startTime
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time. Please check your time selection.");
        }

        // Validate bookingDate is not in the past
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past. Please select today or a future date.");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(request.getResourceId(),
                request.getBookingDate(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                    "This resource is already booked for the selected date and time range.");
        }

        // Create and save the booking
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setResourceName(request.getResourceName());
        booking.setRequestedBy(request.getRequestedBy());
        booking.setRequestedByEmail(request.getRequestedByEmail());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus("PENDING");

        Booking savedBooking = bookingRepository.save(booking);
        return toResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByEmail(String email) {
        return bookingRepository.findByRequestedByEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceIdOrderByCreatedAtDesc(resourceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByStatus(String status) {
        return bookingRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        return toResponse(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (request == null || request.getStatus() == null
                || request.getStatus().isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }

        String currentStatus = booking.getStatus();
        String newStatus = request.getStatus().trim().toUpperCase();

        // Validate status transitions
        if ("PENDING".equals(currentStatus)) {
            if (!("APPROVED".equals(newStatus) || "REJECTED".equals(newStatus))) {
                throw new IllegalArgumentException(
                        "PENDING bookings can only be transitioned to APPROVED or REJECTED.");
            }
        } else if ("APPROVED".equals(currentStatus)) {
            if (!"CANCELLED".equals(newStatus)) {
                throw new IllegalArgumentException("APPROVED bookings can only be CANCELLED.");
            }
        } else if ("REJECTED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
            throw new IllegalArgumentException("Booking is already closed and cannot be updated.");
        }

        booking.setStatus(newStatus);
        booking.setAdminNote(request.getAdminNote());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return toResponse(updatedBooking);
    }

    @Override
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        bookingRepository.delete(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                booking.getResourceName(),
                booking.getRequestedBy(),
                booking.getRequestedByEmail(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus(),
                booking.getAdminNote(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
