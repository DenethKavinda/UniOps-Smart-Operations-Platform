package com.campus.booking;

import java.util.List;

import com.campus.booking.dto.BookingResponse;
import com.campus.booking.dto.CreateBookingRequest;
import com.campus.booking.dto.UpdateBookingStatusRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    List<BookingResponse> getAllBookings();

    List<BookingResponse> getBookingsByEmail(String email);

    List<BookingResponse> getBookingsByResource(Long resourceId);

    List<BookingResponse> getBookingsByStatus(String status);

    BookingResponse getBookingById(Long id);

    BookingResponse updateBookingStatus(Long id, UpdateBookingStatusRequest request);

    void deleteBooking(Long id);
}
