package com.campus.booking;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatusIgnoreCase(String status);

    List<Booking> findTop5ByOrderByCreatedAtDesc();
}
