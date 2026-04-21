package com.campus.common.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.campus.asset.Asset;
import com.campus.asset.AssetRepository;
import com.campus.asset.AssetStatus;
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

        bookingRepository.saveAll(List.of(
                createBooking("Auditorium A", "CONFIRMED"),
                createBooking("Lab 2", "PENDING"),
                createBooking("Conference Hall", "CONFIRMED"),
                createBooking("Sports Complex", "CANCELLED")));
    }

    private Booking createBooking(String title, String status) {
        Booking booking = new Booking();
        booking.setTitle(title);
        booking.setStatus(status);
        booking.setCreatedAt(LocalDateTime.now().minusDays(2));
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
        if (assetRepository.count() == 0) {
            assetRepository.saveAll(List.of(
                    createAsset("Lecture Hall A", "LECTURE_HALL", 180, "Block A - Level 1",
                            AssetStatus.ACTIVE.name()),
                    createAsset("Computer Lab 2", "LAB", 45, "Engineering Building - Level 2",
                            AssetStatus.ACTIVE.name()),
                    createAsset("Meeting Room Omega", "MEETING_ROOM", 12, "Admin Building - Level 3",
                            AssetStatus.ACTIVE.name()),
                    createAsset("Projector Kit 01", "EQUIPMENT", 0, "AV Store - Ground Floor",
                            AssetStatus.OUT_OF_SERVICE.name())));
            return;
        }

        boolean changed = false;
        List<Asset> existing = assetRepository.findAll();
        for (Asset asset : existing) {
            if (asset.getType() == null || asset.getType().isBlank()) {
                asset.setType("EQUIPMENT");
                changed = true;
            }
            if (asset.getCapacity() == null) {
                asset.setCapacity(0);
                changed = true;
            }
            if (asset.getLocation() == null || asset.getLocation().isBlank()) {
                asset.setLocation("Unknown");
                changed = true;
            }

            String status = asset.getStatus();
            if (status == null || status.isBlank()) {
                asset.setStatus(AssetStatus.ACTIVE.name());
                changed = true;
            } else {
                String normalized = status.trim().toUpperCase();
                if (!normalized.equals(AssetStatus.ACTIVE.name())
                        && !normalized.equals(AssetStatus.OUT_OF_SERVICE.name())) {
                    asset.setStatus(AssetStatus.ACTIVE.name());
                    changed = true;
                } else if (!normalized.equals(asset.getStatus())) {
                    asset.setStatus(normalized);
                    changed = true;
                }
            }
        }

        if (changed) {
            assetRepository.saveAll(existing);
        }
    }

    private Asset createAsset(String name, String type, int capacity, String location, String status) {
        Asset asset = new Asset();
        asset.setName(name);
        asset.setType(type);
        asset.setCapacity(capacity);
        asset.setLocation(location);
        asset.setStatus(status);
        asset.setCreatedAt(LocalDateTime.now().minusDays(4));
        return asset;
    }
}
