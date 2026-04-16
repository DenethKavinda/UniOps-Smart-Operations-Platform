package com.campus.notification;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.campus.notification.dto.CreateNotificationRequest;
import com.campus.notification.dto.NotificationDocumentResponse;
import com.campus.notification.dto.NotificationResponse;

public interface NotificationService {

    List<NotificationResponse> getAll();

    NotificationResponse create(CreateNotificationRequest request);

    NotificationResponse create(CreateNotificationRequest request, MultipartFile document);

    NotificationDocumentResponse getDocument(Long id);

    void delete(Long id);

    SseEmitter subscribe();
}
