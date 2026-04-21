package com.campus.common.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campus.asset.Asset;
import com.campus.asset.AssetRepository;
import com.campus.booking.Booking;
import com.campus.booking.BookingRepository;
import com.campus.common.response.ApiResponse;
import com.campus.common.response.HomeDashboardResponse;
import com.campus.common.response.HomeDashboardResponse.HomeActivityResponse;
import com.campus.maintenance.Maintenance;
import com.campus.maintenance.MaintenanceRepository;

@RestController
@RequestMapping("/api")
public class HomeDashboardController {

    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;

    public HomeDashboardController(BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository, AssetRepository assetRepository) {
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
    }

    @GetMapping("/dashboard/home")
    public ResponseEntity<ApiResponse<HomeDashboardResponse>> homeDashboard() {
        long totalResources = assetRepository.count();
        long availableResources = assetRepository.countByStatusIgnoreCase("AVAILABLE");
        long busyResources = Math.max(0, totalResources - availableResources);
        long activeBookings = bookingRepository.countByStatusIgnoreCase("APPROVED");
        long pendingBookings = bookingRepository.countByStatusIgnoreCase("PENDING");
        long openTickets = maintenanceRepository.countByStatusIgnoreCase("OPEN");
        long inProgressTickets = maintenanceRepository.countByStatusIgnoreCase("IN_PROGRESS");
        long highPriorityTickets = openTickets + inProgressTickets;

        List<HomeActivityResponse> activities = new ArrayList<>();
        bookingRepository.findTop5ByOrderByCreatedAtDesc().forEach((Booking booking)
                -> activities.add(new HomeActivityResponse(
                        booking.getStatus() != null && booking.getStatus().equalsIgnoreCase("APPROVED")
                        ? "booking-approved"
                        : booking.getStatus() != null && booking.getStatus().equalsIgnoreCase("PENDING")
                        ? "booking-pending"
                        : "booking-updated",
                        booking.getStatus() != null && booking.getStatus().equalsIgnoreCase("APPROVED")
                        ? "Booking approved"
                        : booking.getStatus() != null && booking.getStatus().equalsIgnoreCase("PENDING")
                        ? "Booking pending"
                        : "Booking updated",
                        booking.getResourceName(),
                        booking.getCreatedAt())));

        maintenanceRepository.findTop5ByOrderByCreatedAtDesc().forEach((Maintenance maintenance)
                -> activities.add(new HomeActivityResponse(
                        maintenance.getStatus() != null && maintenance.getStatus().equalsIgnoreCase("OPEN")
                        ? "ticket-created"
                        : maintenance.getStatus() != null
                        && maintenance.getStatus().equalsIgnoreCase("IN_PROGRESS")
                        ? "technician-assigned"
                        : "ticket-resolved",
                        maintenance.getStatus() != null && maintenance.getStatus().equalsIgnoreCase("OPEN")
                        ? "Ticket created"
                        : maintenance.getStatus() != null
                        && maintenance.getStatus().equalsIgnoreCase("IN_PROGRESS")
                        ? "Technician assigned"
                        : "Ticket resolved",
                        maintenance.getTitle(),
                        maintenance.getCreatedAt())));

        assetRepository.findTop5ByOrderByCreatedAtDesc().forEach((Asset asset)
                -> activities.add(new HomeActivityResponse(
                        "asset-status",
                        "Asset status updated",
                        asset.getName() + " is now " + asset.getStatus(),
                        asset.getCreatedAt())));

        activities.sort(Comparator.comparing(HomeActivityResponse::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        HomeDashboardResponse response = new HomeDashboardResponse(totalResources, activeBookings, pendingBookings,
                openTickets, inProgressTickets, highPriorityTickets, availableResources, busyResources,
                activities.stream().limit(5).toList());

        return ResponseEntity.ok(ApiResponse.success("Home dashboard loaded successfully.", response));
    }
}
