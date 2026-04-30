package com.campus.facility;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.common.response.ApiResponse;
import com.campus.facility.dto.FacilityRequest;
import com.campus.facility.dto.FacilityResponse;

@RestController
@RequestMapping("/api")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping("/admin/facilities")
    public ResponseEntity<ApiResponse<FacilityResponse>> create(@RequestBody FacilityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Facility created successfully.",
                facilityService.createFacility(request)));
    }

    @GetMapping("/admin/facilities")
    public ResponseEntity<ApiResponse<List<FacilityResponse>>> adminList(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Facilities loaded successfully.",
                facilityService.searchFacilities(q, type, minCapacity, location, status)));
    }

    @GetMapping("/admin/facilities/{id}")
    public ResponseEntity<ApiResponse<FacilityResponse>> adminGet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Facility loaded successfully.",
                facilityService.getFacility(id)));
    }

    @PutMapping("/admin/facilities/{id}")
    public ResponseEntity<ApiResponse<FacilityResponse>> update(@PathVariable Long id,
            @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully.",
                facilityService.updateFacility(id, request)));
    }

    @DeleteMapping("/admin/facilities/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully.", null));
    }

    @PutMapping("/admin/facilities/{id}/toggle-availability")
    public ResponseEntity<ApiResponse<FacilityResponse>> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Facility availability toggled successfully.",
                facilityService.toggleAvailability(id)));
    }

    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<FacilityResponse>>> browse(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Facilities loaded successfully.",
                facilityService.searchFacilities(q, type, minCapacity, location, status)));
    }

    @GetMapping("/facilities/{id}")
    public ResponseEntity<ApiResponse<FacilityResponse>> details(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Facility loaded successfully.",
                facilityService.getFacility(id)));
    }
}
