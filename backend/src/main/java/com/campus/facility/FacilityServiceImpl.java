package com.campus.facility;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campus.common.exception.ResourceNotFoundException;
import com.campus.facility.dto.FacilityRequest;
import com.campus.facility.dto.FacilityResponse;

import jakarta.persistence.criteria.Predicate;

@Service
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityServiceImpl(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    @Override
    @Transactional
    public FacilityResponse createFacility(FacilityRequest request) {
        validateFacilityRequest(request);

        Facility facility = new Facility();
        applyRequest(facility, request);
        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public FacilityResponse updateFacility(Long facilityId, FacilityRequest request) {
        if (facilityId == null) {
            throw new IllegalArgumentException("Facility id is required.");
        }
        validateFacilityRequest(request);

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found."));

        applyRequest(facility, request);
        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteFacility(Long facilityId) {
        if (facilityId == null) {
            throw new IllegalArgumentException("Facility id is required.");
        }
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found."));
        facilityRepository.delete(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponse getFacility(Long facilityId) {
        if (facilityId == null) {
            throw new IllegalArgumentException("Facility id is required.");
        }
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found."));
        return toResponse(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityResponse> searchFacilities(String q, String type, Integer minCapacity, String location,
            String status) {
        Specification<Facility> spec = buildSpec(q, type, minCapacity, location, status);

        return facilityRepository.findAll(spec).stream()
                .sorted(Comparator.comparing(Facility::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FacilityResponse toggleAvailability(Long facilityId) {
        if (facilityId == null) {
            throw new IllegalArgumentException("Facility id is required.");
        }
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found."));

        // Toggle between ACTIVE and OUT_OF_SERVICE
        String currentStatus = facility.getStatus();
        String newStatus = FacilityStatus.ACTIVE.name().equals(currentStatus)
                ? FacilityStatus.OUT_OF_SERVICE.name()
                : FacilityStatus.ACTIVE.name();

        facility.setStatus(newStatus);
        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    private void validateFacilityRequest(FacilityRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }
        if (request.getType() == null || request.getType().isBlank()) {
            throw new IllegalArgumentException("Type is required.");
        }
        validateType(request.getType());

        if (request.getCapacity() == null || request.getCapacity() < 0) {
            throw new IllegalArgumentException("Capacity must be 0 or greater.");
        }
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new IllegalArgumentException("Location is required.");
        }
        normalizeAndValidateStatus(request.getStatus());
    }

    private void validateType(String raw) {
        String value = raw;
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Type is required.");
        }
        try {
            FacilityType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Type must be LAB, LECTURE_HALL, or MEETING_ROOM.");
        }
    }

    private FacilityStatus normalizeAndValidateStatus(String raw) {
        String value = raw;
        if (value == null || value.isBlank()) {
            return FacilityStatus.ACTIVE;
        }
        try {
            return FacilityStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Status must be ACTIVE or OUT_OF_SERVICE.");
        }
    }

    private void applyRequest(Facility facility, FacilityRequest request) {
        facility.setName(request.getName().trim());
        facility.setType(request.getType().trim().toUpperCase(Locale.ROOT));
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation().trim());
        facility.setHasProjector(request.getHasProjector() != null ? request.getHasProjector() : true);
        facility.setHasCamera(request.getHasCamera() != null ? request.getHasCamera() : true);
        facility.setStatus(normalizeAndValidateStatus(request.getStatus()).name());
    }

    private Specification<Facility> buildSpec(String q, String type, Integer minCapacity, String location,
            String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("type")), type.trim().toUpperCase(Locale.ROOT)));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (location != null && !location.isBlank()) {
                String pattern = "%" + location.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), pattern));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), normalizeAndValidateStatus(status).name()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private FacilityResponse toResponse(Facility facility) {
        boolean availableNow = isAvailableNow(facility);

        return new FacilityResponse(facility.getId(), facility.getName(), facility.getType(),
                facility.getCapacity(), facility.getLocation(), facility.getHasProjector(),
                facility.getHasCamera(), facility.getStatus(), availableNow, facility.getCreatedAt());
    }

    private boolean isAvailableNow(Facility facility) {
        if (facility == null) {
            return false;
        }
        return FacilityStatus.ACTIVE.name().equalsIgnoreCase(facility.getStatus());
    }
}
