package com.campus.notification;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.campus.common.response.ApiResponse;
import com.campus.notification.dto.CreateNotificationRequest;
import com.campus.notification.dto.NotificationDocumentResponse;
import com.campus.notification.dto.NotificationResponse;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success("Notifications loaded successfully.", notificationService.getAll()));
    }

    @GetMapping(path = "/notifications/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        return notificationService.subscribe();
    }

    @GetMapping("/notifications/{id}/document")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable Long id) {
        NotificationDocumentResponse document = notificationService.getDocument(id);
        ByteArrayResource resource = new ByteArrayResource(document.getData());

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(document.getContentType());
        } catch (Exception ex) {
            mediaType = MediaType.parseMediaType(MimeTypeUtils.APPLICATION_OCTET_STREAM_VALUE);
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + document.getFileName().replace("\"", "") + "\"")
                .body(resource);
    }

    @PostMapping("/admin/notifications")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotificationWithFile(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(required = false) String linkLabel,
            @RequestParam(required = false) String documentUrl,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) MultipartFile document) {
        CreateNotificationRequest request = new CreateNotificationRequest();
        request.setTitle(title);
        request.setMessage(message);
        request.setLinkUrl(linkUrl);
        request.setLinkLabel(linkLabel);
        request.setDocumentUrl(documentUrl);
        request.setCreatedBy(createdBy);

        return ResponseEntity.ok(ApiResponse.success("Notification created successfully.",
                notificationService.create(request, document)));
    }

    @DeleteMapping("/admin/notifications/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Notification removed successfully.", null));
    }
}
