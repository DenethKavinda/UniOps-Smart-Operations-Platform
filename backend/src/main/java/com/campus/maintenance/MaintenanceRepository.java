package com.campus.maintenance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    long countByStatusIgnoreCase(String status);

    List<Maintenance> findTop5ByOrderByCreatedAtDesc();
}
