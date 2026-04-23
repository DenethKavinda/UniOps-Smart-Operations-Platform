package com.campus.incident;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campus.common.response.ApiResponse;
import com.campus.incident.dto.AddIncidentAttachmentRequest;
import com.campus.incident.dto.AssignIncidentRequest;
import com.campus.incident.dto.CreateIncidentCommentRequest;
import com.campus.incident.dto.CreateIncidentRequest;
import com.campus.incident.dto.IncidentAttachmentDownloadResponse;
import com.campus.incident.dto.IncidentResponse;
import com.campus.incident.dto.UpdateIncidentCommentRequest;
import com.campus.incident.dto.UpdateIncidentStatusRequest;

@RestController
@RequestMapping("/api")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping(value = "/incidents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String resourceName,
            @RequestParam String location,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam IncidentPriority priority,
            @RequestParam String createdByName,
            @RequestParam String createdByEmail,
            @RequestParam(required = false) String preferredContactName,
            @RequestParam(required = false) String preferredContactEmail,
            @RequestParam(required = false) String preferredContactPhone,
            @RequestParam(required = false) List<MultipartFile> images) {

        CreateIncidentRequest request = new CreateIncidentRequest();
        request.setResourceId(resourceId);
        request.setResourceName(resourceName);
        request.setLocation(location);
        request.setCategory(category);
        request.setDescription(description);
        request.setPriority(priority);
        request.setCreatedByName(createdByName);
        request.setCreatedByEmail(createdByEmail);
        request.setPreferredContactName(preferredContactName);
        request.setPreferredContactEmail(preferredContactEmail);
        request.setPreferredContactPhone(preferredContactPhone);

        IncidentResponse response = incidentService.createIncident(request, images);
        return ResponseEntity.ok(ApiResponse.success("Incident ticket created successfully.", response));
    }

    @GetMapping("/incidents")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getIncidents(
            @RequestParam(required = false) String createdByEmail,
            @RequestParam(required = false) String assignedToEmail) {
        List<IncidentResponse> response;
        if (createdByEmail != null && !createdByEmail.trim().isEmpty()) {
            response = incidentService.getIncidentsByReporter(createdByEmail);
        } else if (assignedToEmail != null && !assignedToEmail.trim().isEmpty()) {
            response = incidentService.getIncidentsByAssignee(assignedToEmail);
        } else {
            response = incidentService.getAllIncidents();
        }
        return ResponseEntity.ok(ApiResponse.success("Incident tickets loaded successfully.", response));
    }

    @GetMapping("/incidents/{incidentId}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncident(@PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success("Incident ticket loaded successfully.",
                incidentService.getIncident(incidentId)));
    }

    @PutMapping("/incidents/{incidentId}/assign")
    public ResponseEntity<ApiResponse<IncidentResponse>> assignIncident(@PathVariable Long incidentId,
            @RequestBody AssignIncidentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Incident assignment updated successfully.",
                incidentService.assignIncident(incidentId, request)));
    }

    @PutMapping("/incidents/{incidentId}/status")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateStatus(@PathVariable Long incidentId,
            @RequestBody UpdateIncidentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Incident status updated successfully.",
                incidentService.updateIncidentStatus(incidentId, request)));
    }

    @PostMapping("/incidents/{incidentId}/comments")
    public ResponseEntity<ApiResponse<IncidentResponse>> addComment(@PathVariable Long incidentId,
            @RequestBody CreateIncidentCommentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully.",
                incidentService.addComment(incidentId, request)));
    }

    @PutMapping("/incidents/{incidentId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateComment(@PathVariable Long incidentId,
            @PathVariable Long commentId,
            @RequestBody UpdateIncidentCommentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully.",
                incidentService.updateComment(incidentId, commentId, request)));
    }

    @DeleteMapping("/incidents/{incidentId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long incidentId,
            @PathVariable Long commentId,
            @RequestParam String requesterEmail) {
        incidentService.deleteComment(incidentId, commentId, requesterEmail);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully.", null));
    }

    @PostMapping(value = "/incidents/{incidentId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<IncidentResponse>> addAttachments(@PathVariable Long incidentId,
            @RequestParam(required = false) String uploadedByEmail,
            @RequestParam List<MultipartFile> images) {
        AddIncidentAttachmentRequest request = new AddIncidentAttachmentRequest();
        request.setUploadedByEmail(uploadedByEmail);
        return ResponseEntity.ok(ApiResponse.success("Incident attachments updated successfully.",
                incidentService.addAttachments(incidentId, request, images)));
    }

    @GetMapping("/incidents/{incidentId}/attachments/{attachmentId}")
    public ResponseEntity<ByteArrayResource> getAttachment(@PathVariable Long incidentId, @PathVariable Long attachmentId) {
        IncidentAttachmentDownloadResponse attachment = incidentService.getAttachment(incidentId, attachmentId);
        ByteArrayResource resource = new ByteArrayResource(attachment.getData());

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(attachment.getContentType());
        } catch (Exception ex) {
            mediaType = MediaType.parseMediaType(MimeTypeUtils.APPLICATION_OCTET_STREAM_VALUE);
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + attachment.getFileName().replace("\"", "") + "\"")
                .body(resource);
    }
}
