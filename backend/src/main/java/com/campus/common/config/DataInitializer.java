package com.campus.common.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.campus.asset.Asset;
import com.campus.asset.AssetRepository;
import com.campus.booking.Booking;
import com.campus.booking.BookingRepository;
import com.campus.maintenance.Maintenance;
import com.campus.maintenance.MaintenanceRepository;
import com.campus.user.User;
import com.campus.user.UserRepository;
import com.campus.user.UserRole;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository, BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository, AssetRepository assetRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            seedUsers(userRepository, passwordEncoder);
            seedBookings(bookingRepository);
            seedMaintenance(maintenanceRepository);
            seedAssets(assetRepository);
        };
    }

    private void seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        ensureAdminUser(userRepository,
                createUser("Amina Rahman", "admin1@uniops.edu", "Admin@1234", UserRole.ADMIN,
                        false, 12, passwordEncoder));
        ensureAdminUser(userRepository,
                createUser("Daniel Perera", "admin2@uniops.edu", "Ops@1234", UserRole.ADMIN,
                        false, 9, passwordEncoder));
        ensureAdminUser(userRepository,
                createUser("Sadeeka Silva", "admin3@uniops.edu", "Secure@1234",
                        UserRole.ADMIN, false, 7, passwordEncoder));
        ensureAdminUser(userRepository,
                createUser("Nirmal Fernando", "admin4@uniops.edu", "Support@1234",
                        UserRole.ADMIN, false, 5, passwordEncoder));

        if (userRepository.count() == 4) {
            userRepository.saveAll(List.of(
                    createUser("Kavindi Jayasuriya", "student1@uniops.edu", "Student@123", UserRole.STUDENT,
                            false, 4, passwordEncoder),
                    createUser("Pasan Rodrigo", "student2@uniops.edu", "Student@234", UserRole.STUDENT, false,
                            8, passwordEncoder),
                    createUser("Ishara Wickramasinghe", "student3@uniops.edu", "Student@345", UserRole.STUDENT,
                            true, 2, passwordEncoder),
                    createUser("Tharindu Mendis", "student4@uniops.edu", "Student@456", UserRole.STUDENT,
                            false, 1, passwordEncoder),
                    createUser("Nethmi Perera", "student5@uniops.edu", "Student@567", UserRole.STUDENT, false,
                            6, passwordEncoder),
                    createUser("Ravindu Lakshan", "student6@uniops.edu", "Student@678", UserRole.STUDENT, false,
                            3, passwordEncoder)));
        }
    }

    private void ensureAdminUser(UserRepository userRepository, User adminTemplate) {
        User user = userRepository.findByEmail(adminTemplate.getEmail()).orElse(null);
        if (user == null) {
            userRepository.save(adminTemplate);
            return;
        }

        user.setName(adminTemplate.getName());
        user.setPassword(adminTemplate.getPassword());
        user.setRole(UserRole.ADMIN);
        user.setBlocked(false);

        if (user.getLoginCount() < adminTemplate.getLoginCount()) {
            user.setLoginCount(adminTemplate.getLoginCount());
        }
        if (user.getLastLoginAt() == null) {
            user.setLastLoginAt(adminTemplate.getLastLoginAt());
        }
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(adminTemplate.getCreatedAt());
        }

        userRepository.save(user);
    }

    private User createUser(String name, String email, String password, UserRole role, boolean blocked,
            int loginCount, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setBlocked(blocked);
        user.setLoginCount(loginCount);
        user.setCreatedAt(LocalDateTime.now().minusDays(loginCount + 1L));
        user.setLastLoginAt(LocalDateTime.now().minusHours(loginCount));
        return user;
    }

    private void seedBookings(BookingRepository bookingRepository) {
        if (bookingRepository.count() > 0) {
            return;
        }

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate dayAfterTomorrow = LocalDate.now().plusDays(2);
        LocalDate yesterday = LocalDate.now().minusDays(1);

        bookingRepository.saveAll(List.of(
                createBooking("Auditorium A", 1L, "Auditorium A", "Kavindi Jayasuriya",
                        "student1@uniops.edu", "Year-end ceremony", null, tomorrow, LocalTime.of(9, 0),
                        LocalTime.of(11, 0), "APPROVED", null, LocalDateTime.now().minusDays(2)),
                createBooking("Lab 2", 2L, "Lab 2", "Pasan Rodrigo", "student2@uniops.edu",
                        "Group project session", null, dayAfterTomorrow, LocalTime.of(14, 0),
                        LocalTime.of(16, 0), "PENDING", null, LocalDateTime.now().minusDays(2)),
                createBooking("Conference Hall", 3L, "Conference Hall", "Tharindu Mendis",
                        "student4@uniops.edu", "Department meeting", null, tomorrow, LocalTime.of(13, 0),
                        LocalTime.of(15, 0), "APPROVED", null, LocalDateTime.now().minusDays(2)),
                createBooking("Sports Complex", 4L, "Sports Complex", "Nethmi Perera",
                        "student5@uniops.edu", "Sports event", null, yesterday, LocalTime.of(8, 0),
                        LocalTime.of(10, 0), "CANCELLED", "Event postponed", LocalDateTime.now().minusDays(3))));
    }

    private Booking createBooking(String title, Long resourceId, String resourceName, String requestedBy,
            String requestedByEmail, String purpose, Integer expectedAttendees, LocalDate bookingDate,
            LocalTime startTime, LocalTime endTime, String status, String adminNote, LocalDateTime createdAt) {
        Booking booking = new Booking();
        booking.setResourceId(resourceId);
        booking.setResourceName(resourceName);
        booking.setRequestedBy(requestedBy);
        booking.setRequestedByEmail(requestedByEmail);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(expectedAttendees);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(status);
        booking.setAdminNote(adminNote);
        booking.setCreatedAt(createdAt);
        return booking;
    }

    private void seedMaintenance(MaintenanceRepository maintenanceRepository) {
        if (maintenanceRepository.count() > 0) {
            return;
        }

        maintenanceRepository.saveAll(List.of(
                createMaintenance("Projector calibration", "OPEN"),
                createMaintenance("AC servicing", "IN_PROGRESS"),
                createMaintenance("Lighting repair", "RESOLVED")));
    }

    private Maintenance createMaintenance(String title, String status) {
        Maintenance maintenance = new Maintenance();
        maintenance.setTitle(title);
        maintenance.setStatus(status);
        maintenance.setCreatedAt(LocalDateTime.now().minusDays(3));
        return maintenance;
    }

    private void seedAssets(AssetRepository assetRepository) {
        if (assetRepository.count() > 0) {
            return;
        }

        assetRepository.saveAll(List.of(
                createAsset("Laptop Fleet", "IN_USE"),
                createAsset("Projectors", "AVAILABLE"),
                createAsset("Smart Boards", "MAINTENANCE"),
                createAsset("Lab Tablets", "IN_USE")));
    }

    private Asset createAsset(String name, String status) {
        Asset asset = new Asset();
        asset.setName(name);
        asset.setStatus(status);
        asset.setCreatedAt(LocalDateTime.now().minusDays(4));
        return asset;
    }
}
