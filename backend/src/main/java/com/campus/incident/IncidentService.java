package com.campus.incident;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.campus.incident.dto.AddIncidentAttachmentRequest;
import com.campus.incident.dto.AssignIncidentRequest;
import com.campus.incident.dto.CreateIncidentCommentRequest;
import com.campus.incident.dto.CreateIncidentRequest;
import com.campus.incident.dto.IncidentAttachmentDownloadResponse;
import com.campus.incident.dto.IncidentResponse;
import com.campus.incident.dto.UpdateIncidentCommentRequest;
import com.campus.incident.dto.UpdateIncidentStatusRequest;

public interface IncidentService {

    IncidentResponse createIncident(CreateIncidentRequest request, List<MultipartFile> images);

    List<IncidentResponse> getAllIncidents();

    List<IncidentResponse> getIncidentsByReporter(String createdByEmail);

    List<IncidentResponse> getIncidentsByAssignee(String assignedToEmail);

    IncidentResponse getIncident(Long incidentId);

    IncidentResponse assignIncident(Long incidentId, AssignIncidentRequest request);

    IncidentResponse updateIncidentStatus(Long incidentId, UpdateIncidentStatusRequest request);

    IncidentResponse addComment(Long incidentId, CreateIncidentCommentRequest request);

    IncidentResponse updateComment(Long incidentId, Long commentId, UpdateIncidentCommentRequest request);

    void deleteComment(Long incidentId, Long commentId, String requesterEmail);

    IncidentResponse addAttachments(Long incidentId, AddIncidentAttachmentRequest request, List<MultipartFile> images);

    IncidentAttachmentDownloadResponse getAttachment(Long incidentId, Long attachmentId);
}
