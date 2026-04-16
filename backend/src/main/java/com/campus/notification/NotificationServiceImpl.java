package com.campus.notification;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.campus.common.exception.ResourceNotFoundException;
import com.campus.notification.dto.CreateNotificationRequest;
import com.campus.notification.dto.NotificationDocumentResponse;
import com.campus.notification.dto.NotificationResponse;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final long SSE_TIMEOUT = 0L;
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public List<NotificationResponse> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    public NotificationResponse create(CreateNotificationRequest request) {
        return create(request, null);
    }

    @Override
    public NotificationResponse create(CreateNotificationRequest request, MultipartFile document) {
        if (request == null) {
            throw new IllegalArgumentException("Notification details are required.");
        }

        String title = normalize(request.getTitle());
        String message = normalize(request.getMessage());
        if (title == null) {
            throw new IllegalArgumentException("Notification title is required.");
        }
        if (message == null) {
            throw new IllegalArgumentException("Notification message is required.");
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLinkUrl(normalize(request.getLinkUrl()));
        notification.setLinkLabel(normalize(request.getLinkLabel()));
        notification.setDocumentUrl(normalize(request.getDocumentUrl()));
        notification.setCreatedBy(normalize(request.getCreatedBy()));

        if (document != null && !document.isEmpty()) {
            if (document.getSize() > MAX_FILE_SIZE_BYTES) {
                throw new IllegalArgumentException("Document size must be less than 10 MB.");
            }
            try {
                notification.setDocumentData(document.getBytes());
            } catch (IOException ex) {
                throw new IllegalArgumentException("Unable to read uploaded document.");
            }
            notification.setDocumentName(normalize(document.getOriginalFilename()));
            notification.setDocumentContentType(normalize(document.getContentType()));
        }

        Notification saved = notificationRepository.save(notification);
        broadcast("notification-created");
        return toResponse(saved);
    }

    @Override
    public NotificationDocumentResponse getDocument(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (notification.getDocumentData() == null || notification.getDocumentData().length == 0) {
            throw new ResourceNotFoundException("Document not found for this notification.");
        }

        return new NotificationDocumentResponse(notification.getDocumentData(),
                normalize(notification.getDocumentName()) == null ? "notification-document" : notification.getDocumentName(),
                normalize(notification.getDocumentContentType()) == null ? "application/octet-stream"
                : notification.getDocumentContentType());
    }

    @Override
    public void delete(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        notificationRepository.delete(notification);
        broadcast("notification-deleted");
    }

    @Override
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("ready").data("connected"));
        } catch (IOException ex) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    private void broadcast(String eventName) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data("refresh"));
            } catch (IOException ex) {
                emitters.remove(emitter);
            }
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.getLinkUrl(), notification.getLinkLabel(), notification.getDocumentUrl(),
                notification.getDocumentData() != null && notification.getDocumentData().length > 0,
                notification.getDocumentName(), notification.getDocumentContentType(), notification.getCreatedBy(),
                notification.getCreatedAt());
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
