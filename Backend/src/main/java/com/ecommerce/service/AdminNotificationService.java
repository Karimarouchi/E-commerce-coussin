package com.ecommerce.service;

import com.ecommerce.dto.response.AdminNotificationResponse;
import com.ecommerce.entity.AdminNotification;
import com.ecommerce.entity.Order;
import com.ecommerce.repository.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminNotificationRepository notificationRepository;

    @Transactional
    public void notifyNewOrder(Order order) {
        String client = ((order.getFirstName() != null ? order.getFirstName() : "") + " "
                + (order.getLastName() != null ? order.getLastName() : "")).trim();
        if (client.isBlank()) client = order.getEmail();

        String total = String.format(Locale.FRANCE, "%.2f DT", order.getTotal());

        AdminNotification n = AdminNotification.builder()
                .type("ORDER")
                .title("Nouvelle commande")
                .message(String.format("%s — %s (%s)", order.getReference(), client, total))
                .link("/commandes/" + order.getId())
                .orderId(order.getId())
                .read(false)
                .build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<AdminNotificationResponse> getRecent() {
        return notificationRepository.findTop30ByOrderByCreatedAtDesc().stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public AdminNotificationResponse markRead(Long id) {
        AdminNotification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        n.setRead(true);
        return map(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.findByReadFalseOrderByCreatedAtDesc().forEach(n -> n.setRead(true));
    }

    private AdminNotificationResponse map(AdminNotification n) {
        return AdminNotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .orderId(n.getOrderId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
