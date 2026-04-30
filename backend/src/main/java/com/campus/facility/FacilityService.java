package com.campus.facility;

import java.util.List;

import com.campus.facility.dto.FacilityRequest;
import com.campus.facility.dto.FacilityResponse;

public interface FacilityService {

    FacilityResponse createFacility(FacilityRequest request);

    FacilityResponse updateFacility(Long facilityId, FacilityRequest request);

    void deleteFacility(Long facilityId);

    FacilityResponse getFacility(Long facilityId);

    List<FacilityResponse> searchFacilities(String q, String type, Integer minCapacity, String location, String status);

    FacilityResponse toggleAvailability(Long facilityId);
}
