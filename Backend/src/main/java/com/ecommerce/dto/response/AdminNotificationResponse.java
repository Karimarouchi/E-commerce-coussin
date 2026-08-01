package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class AdminNotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private Long orderId;
    private boolean read;
    private LocalDateTime createdAt;
}
