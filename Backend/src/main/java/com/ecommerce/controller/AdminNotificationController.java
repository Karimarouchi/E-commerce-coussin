package com.ecommerce.controller;

import com.ecommerce.dto.response.AdminNotificationResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.service.AdminNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<AdminNotificationResponse>> getRecent() {
        return ResponseEntity.ok(notificationService.getRecent());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<AdminNotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(new MessageResponse("Toutes les notifications ont été marquées comme lues"));
    }
}
