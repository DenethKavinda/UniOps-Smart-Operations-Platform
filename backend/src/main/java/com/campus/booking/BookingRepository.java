package com.campus.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatusIgnoreCase(String status);

    List<Booking> findTop5ByOrderByCreatedAtDesc();

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByRequestedByEmailOrderByCreatedAtDesc(String email);

    List<Booking> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<Booking> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.bookingDate = :bookingDate AND b.status IN ('PENDING', 'APPROVED') AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate, @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.bookingDate = :bookingDate AND b.status IN ('PENDING', 'APPROVED') AND b.startTime < :endTime AND b.endTime > :startTime AND b.id <> :excludeId")
    List<Booking> findConflictingBookingsExcluding(@Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate, @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime, @Param("excludeId") Long excludeId);
}
