package com.campus.facility;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FacilityRepository extends JpaRepository<Facility, Long>, JpaSpecificationExecutor<Facility> {

    List<Facility> findByStatus(String status);

    List<Facility> findByType(String type);

    List<Facility> findByLocation(String location);
}
