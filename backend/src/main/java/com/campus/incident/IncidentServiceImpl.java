package com.campus.incident;

import java.io.IOException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.campus.asset.Asset;
import com.campus.asset.AssetRepository;
import com.campus.common.exception.ResourceNotFoundException;
import com.campus.incident.dto.AddIncidentAttachmentRequest;
import com.campus.incident.dto.AssignIncidentRequest;
import com.campus.incident.dto.CreateIncidentCommentRequest;
import com.campus.incident.dto.CreateIncidentRequest;
import com.campus.incident.dto.IncidentAttachmentDownloadResponse;
import com.campus.incident.dto.IncidentResponse;
import com.campus.incident.dto.UpdateIncidentCommentRequest;
import com.campus.incident.dto.UpdateIncidentStatusRequest;
import com.campus.user.User;
import com.campus.user.UserRepository;
import com.campus.user.UserRole;

@Service
public class IncidentServiceImpl implements IncidentService {

    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;
    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Map<IncidentStatus, Set<IncidentStatus>> ALLOWED_TRANSITIONS = buildTransitionMap();

    private final IncidentTicketRepository incidentTicketRepository;
    private final IncidentCommentRepository incidentCommentRepository;
    private final IncidentAttachmentRepository incidentAttachmentRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;

    public IncidentServiceImpl(IncidentTicketRepository incidentTicketRepository,
            IncidentCommentRepository incidentCommentRepository,
            IncidentAttachmentRepository incidentAttachmentRepository,
            UserRepository userRepository,
            AssetRepository assetRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.incidentCommentRepository = incidentCommentRepository;
        this.incidentAttachmentRepository = incidentAttachmentRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
    }

    @Override
    public IncidentResponse createIncident(CreateIncidentRequest request, List<MultipartFile> images) {
        if (request == null) {
            throw new IllegalArgumentException("Incident details are required.");
        }

        Asset linkedAsset = resolveAsset(request.getResourceId());
        IncidentTicket ticket = new IncidentTicket();
        ticket.setResourceId(linkedAsset == null ? null : linkedAsset.getId());
        ticket.setResourceName(linkedAsset == null
                ? requireValue(request.getResourceName(), "Resource name is required.")
                : linkedAsset.getName());
        ticket.setLocation(requireValue(request.getLocation(), "Location is required."));
        ticket.setCategory(requireValue(request.getCategory(), "Category is required."));
        ticket.setDescription(requireValue(request.getDescription(), "Description is required."));
        ticket.setPriority(request.getPriority() == null ? IncidentPriority.MEDIUM : request.getPriority());
        ticket.setCreatedByName(requireValue(request.getCreatedByName(), "Reporter name is required."));
        ticket.setCreatedByEmail(requireValue(request.getCreatedByEmail(), "Reporter email is required."));
        ticket.setPreferredContactName(normalize(request.getPreferredContactName()));
        ticket.setPreferredContactEmail(normalize(request.getPreferredContactEmail()));
        ticket.setPreferredContactPhone(normalize(request.getPreferredContactPhone()));
        ticket.setStatus(IncidentStatus.OPEN);

        IncidentTicket savedTicket = incidentTicketRepository.save(ticket);
        saveAttachments(savedTicket.getId(), images, ticket.getCreatedByEmail(), true);
        return buildIncidentResponse(savedTicket);
    }

    @Override
    public List<IncidentResponse> getAllIncidents() {
        return incidentTicketRepository.findAllByOrderByCreatedAtDesc().stream().map(this::buildIncidentResponse).toList();
    }

    @Override
    public List<IncidentResponse> getIncidentsByReporter(String createdByEmail) {
        String normalizedEmail = requireValue(createdByEmail, "Reporter email is required.");
        return incidentTicketRepository.findByCreatedByEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail).stream()
                .map(this::buildIncidentResponse)
                .toList();
    }

    @Override
    public List<IncidentResponse> getIncidentsByAssignee(String assignedToEmail) {
        String normalizedEmail = requireValue(assignedToEmail, "Assignee email is required.");
        return incidentTicketRepository.findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail).stream()
                .map(this::buildIncidentResponse)
                .toList();
    }

    @Override
    public IncidentResponse getIncident(Long incidentId) {
        IncidentTicket ticket = findTicket(incidentId);
        return buildIncidentResponse(ticket);
    }

    @Override
    public IncidentResponse assignIncident(Long incidentId, AssignIncidentRequest request) {
        IncidentTicket ticket = findTicket(incidentId);
        if (request == null) {
            throw new IllegalArgumentException("Assignment details are required.");
        }

        User requester = requireUser(request.getRequesterEmail(), "Requester email is required.");
        if (requester.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Only admins can assign a technician or staff member.");
        }

        ticket.setAssignedToName(requireValue(request.getAssigneeName(), "Assignee name is required."));
        ticket.setAssignedToEmail(requireValue(request.getAssigneeEmail(), "Assignee email is required."));

        IncidentTicket updated = incidentTicketRepository.save(ticket);
        return buildIncidentResponse(updated);
    }

    @Override
    public IncidentResponse updateIncidentStatus(Long incidentId, UpdateIncidentStatusRequest request) {
        IncidentTicket ticket = findTicket(incidentId);
        if (request == null) {
            throw new IllegalArgumentException("Status update details are required.");
        }

        IncidentStatus targetStatus = request.getStatus();
        if (targetStatus == null) {
            throw new IllegalArgumentException("Incident status is required.");
        }

        User requester = requireUser(request.getRequesterEmail(), "Requester email is required.");
        validateStatusUpdatePermission(ticket, requester, targetStatus);
        validateStatusTransition(ticket.getStatus(), targetStatus);

        if (targetStatus == IncidentStatus.REJECTED) {
            String rejectReason = requireValue(request.getRejectionReason(),
                    "Rejection reason is required when setting ticket to REJECTED.");
            ticket.setRejectionReason(rejectReason);
            ticket.setResolutionNotes(null);
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        } else {
            ticket.setRejectionReason(null);
            if (targetStatus == IncidentStatus.RESOLVED || targetStatus == IncidentStatus.CLOSED) {
                String resolution = requireValue(request.getResolutionNotes(),
                        "Resolution notes are required when resolving or closing a ticket.");
                ticket.setResolutionNotes(resolution);
            } else if (normalize(request.getResolutionNotes()) != null) {
                ticket.setResolutionNotes(normalize(request.getResolutionNotes()));
            }
        }

        if (targetStatus == IncidentStatus.RESOLVED) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }
        if (targetStatus == IncidentStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(java.time.LocalDateTime.now());
            }
            ticket.setClosedAt(java.time.LocalDateTime.now());
        }
        if (targetStatus == IncidentStatus.OPEN || targetStatus == IncidentStatus.IN_PROGRESS) {
            ticket.setClosedAt(null);
            if (targetStatus == IncidentStatus.OPEN) {
                ticket.setResolvedAt(null);
                ticket.setResolutionNotes(null);
            }
        }

        ticket.setStatus(targetStatus);
        IncidentTicket updated = incidentTicketRepository.save(ticket);
        return buildIncidentResponse(updated);
    }

    @Override
    public IncidentResponse addComment(Long incidentId, CreateIncidentCommentRequest request) {
        IncidentTicket ticket = findTicket(incidentId);
        if (request == null) {
            throw new IllegalArgumentException("Comment details are required.");
        }

        String authorEmail = requireValue(request.getAuthorEmail(), "Comment author email is required.");
        User author = requireUser(authorEmail, "Comment author email is required.");

        IncidentComment comment = new IncidentComment();
        comment.setIncidentTicketId(ticket.getId());
        comment.setAuthorName(requireValue(request.getAuthorName(), "Comment author name is required."));
        comment.setAuthorEmail(author.getEmail());
        comment.setAuthorRole(author.getRole().name());
        comment.setMessage(requireValue(request.getMessage(), "Comment message is required."));

        incidentCommentRepository.save(comment);
        return buildIncidentResponse(ticket);
    }

    @Override
    public IncidentResponse updateComment(Long incidentId, Long commentId, UpdateIncidentCommentRequest request) {
        IncidentTicket ticket = findTicket(incidentId);
        if (request == null) {
            throw new IllegalArgumentException("Comment update details are required.");
        }

        IncidentComment comment = findComment(commentId);
        if (!ticket.getId().equals(comment.getIncidentTicketId())) {
            throw new IllegalArgumentException("Comment does not belong to the selected ticket.");
        }

        User requester = requireUser(request.getRequesterEmail(), "Requester email is required.");
        validateCommentOwnership(requester, comment);

        comment.setMessage(requireValue(request.getMessage(), "Comment message is required."));
        incidentCommentRepository.save(comment);
        return buildIncidentResponse(ticket);
    }

    @Override
    public void deleteComment(Long incidentId, Long commentId, String requesterEmail) {
        IncidentTicket ticket = findTicket(incidentId);
        IncidentComment comment = findComment(commentId);
        if (!ticket.getId().equals(comment.getIncidentTicketId())) {
            throw new IllegalArgumentException("Comment does not belong to the selected ticket.");
        }

        User requester = requireUser(requesterEmail, "Requester email is required.");
        validateCommentOwnership(requester, comment);
        incidentCommentRepository.delete(comment);
    }

    @Override
    public IncidentResponse addAttachments(Long incidentId, AddIncidentAttachmentRequest request, List<MultipartFile> images) {
        IncidentTicket ticket = findTicket(incidentId);
        String uploadedByEmail = request == null ? null : normalize(request.getUploadedByEmail());
        saveAttachments(ticket.getId(), images, uploadedByEmail, false);
        return buildIncidentResponse(ticket);
    }

    @Override
    public IncidentAttachmentDownloadResponse getAttachment(Long incidentId, Long attachmentId) {
        findTicket(incidentId);
        IncidentAttachment attachment = incidentAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident attachment not found."));
        if (!incidentId.equals(attachment.getIncidentTicketId())) {
            throw new ResourceNotFoundException("Attachment not found for this incident ticket.");
        }
        return new IncidentAttachmentDownloadResponse(attachment.getData(), attachment.getFileName(),
                attachment.getContentType());
    }

    private void saveAttachments(Long incidentId, List<MultipartFile> images, String uploadedByEmail, boolean allowEmpty) {
        if (images == null || images.isEmpty()) {
            if (allowEmpty) {
                return;
            }
            throw new IllegalArgumentException("At least one image is required.");
        }

        long existingCount = incidentAttachmentRepository.countByIncidentTicketId(incidentId);
        long incomingCount = images.stream().filter(file -> file != null && !file.isEmpty()).count();
        if (incomingCount == 0) {
            if (allowEmpty) {
                return;
            }
            throw new IllegalArgumentException("At least one image is required.");
        }

        if (existingCount + incomingCount > MAX_ATTACHMENTS_PER_TICKET) {
            throw new IllegalArgumentException("Each ticket can contain up to 3 image attachments.");
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }
            String contentType = normalize(image.getContentType());
            if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                throw new IllegalArgumentException("Only image attachments are allowed.");
            }
            if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
                throw new IllegalArgumentException("Each image must be smaller than 5 MB.");
            }

            IncidentAttachment attachment = new IncidentAttachment();
            attachment.setIncidentTicketId(incidentId);
            attachment.setFileName(normalize(image.getOriginalFilename()) == null
                    ? "incident-image"
                    : normalize(image.getOriginalFilename()));
            attachment.setContentType(contentType);
            attachment.setUploadedByEmail(normalize(uploadedByEmail));
            try {
                attachment.setData(image.getBytes());
            } catch (IOException ex) {
                throw new IllegalArgumentException("Unable to read one or more uploaded images.");
            }
            incidentAttachmentRepository.save(attachment);
        }
    }

    private void validateCommentOwnership(User requester, IncidentComment comment) {
        if (requester.getRole() == UserRole.ADMIN) {
            return;
        }
        if (!requester.getEmail().equalsIgnoreCase(comment.getAuthorEmail())) {
            throw new IllegalStateException("You can only edit or delete your own comments.");
        }
    }

    private void validateStatusUpdatePermission(IncidentTicket ticket, User requester, IncidentStatus targetStatus) {
        if (targetStatus == IncidentStatus.REJECTED && requester.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Only admins can reject tickets.");
        }
        if (requester.getRole() == UserRole.ADMIN) {
            return;
        }

        String assignedToEmail = normalize(ticket.getAssignedToEmail());
        if (assignedToEmail == null || !assignedToEmail.equalsIgnoreCase(requester.getEmail())) {
            throw new IllegalStateException("Only assigned technician/staff or admins can update ticket status.");
        }
    }

    private void validateStatusTransition(IncidentStatus currentStatus, IncidentStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        Set<IncidentStatus> allowedTargets = ALLOWED_TRANSITIONS.get(currentStatus);
        if (allowedTargets == null || !allowedTargets.contains(targetStatus)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from " + currentStatus + " to " + targetStatus + ".");
        }
    }

    private IncidentTicket findTicket(Long incidentId) {
        return incidentTicketRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found."));
    }

    private IncidentComment findComment(Long commentId) {
        return incidentCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident comment not found."));
    }

    private User requireUser(String email, String requiredMessage) {
        String normalizedEmail = requireValue(email, requiredMessage);
        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + normalizedEmail));
    }

    private IncidentResponse buildIncidentResponse(IncidentTicket ticket) {
        IncidentResponse response = new IncidentResponse();
        response.setId(ticket.getId());
        response.setResourceId(ticket.getResourceId());
        response.setResourceName(ticket.getResourceName());
        response.setLocation(ticket.getLocation());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedByName(ticket.getCreatedByName());
        response.setCreatedByEmail(ticket.getCreatedByEmail());
        response.setPreferredContactName(ticket.getPreferredContactName());
        response.setPreferredContactEmail(ticket.getPreferredContactEmail());
        response.setPreferredContactPhone(ticket.getPreferredContactPhone());
        response.setAssignedToName(ticket.getAssignedToName());
        response.setAssignedToEmail(ticket.getAssignedToEmail());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setRejectionReason(ticket.getRejectionReason());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setClosedAt(ticket.getClosedAt());
        response.setAttachments(mapAttachments(ticket.getId()));
        response.setComments(mapComments(ticket.getId()));
        return response;
    }

    private List<IncidentResponse.IncidentAttachmentResponse> mapAttachments(Long ticketId) {
        return incidentAttachmentRepository.findByIncidentTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(attachment -> {
                    IncidentResponse.IncidentAttachmentResponse response = new IncidentResponse.IncidentAttachmentResponse();
                    response.setId(attachment.getId());
                    response.setFileName(attachment.getFileName());
                    response.setContentType(attachment.getContentType());
                    response.setCreatedAt(attachment.getCreatedAt());
                    return response;
                })
                .toList();
    }

    private List<IncidentResponse.IncidentCommentResponse> mapComments(Long ticketId) {
        return incidentCommentRepository.findByIncidentTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(comment -> {
                    IncidentResponse.IncidentCommentResponse response = new IncidentResponse.IncidentCommentResponse();
                    response.setId(comment.getId());
                    response.setAuthorName(comment.getAuthorName());
                    response.setAuthorEmail(comment.getAuthorEmail());
                    response.setAuthorRole(comment.getAuthorRole());
                    response.setMessage(comment.getMessage());
                    response.setCreatedAt(comment.getCreatedAt());
                    response.setUpdatedAt(comment.getUpdatedAt());
                    return response;
                })
                .toList();
    }

    private String requireValue(String value, String message) {
        String normalized = normalize(value);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Asset resolveAsset(Long resourceId) {
        if (resourceId == null) {
            return null;
        }
        return assetRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id: " + resourceId));
    }

    private static Map<IncidentStatus, Set<IncidentStatus>> buildTransitionMap() {
        Map<IncidentStatus, Set<IncidentStatus>> transitions = new EnumMap<>(IncidentStatus.class);
        transitions.put(IncidentStatus.OPEN, Set.of(IncidentStatus.IN_PROGRESS, IncidentStatus.REJECTED));
        transitions.put(IncidentStatus.IN_PROGRESS, Set.of(IncidentStatus.RESOLVED, IncidentStatus.REJECTED));
        transitions.put(IncidentStatus.RESOLVED, Set.of(IncidentStatus.CLOSED));
        transitions.put(IncidentStatus.CLOSED, Set.of());
        transitions.put(IncidentStatus.REJECTED, Set.of());
        return transitions;
    }
}
