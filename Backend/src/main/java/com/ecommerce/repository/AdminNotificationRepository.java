package com.ecommerce.repository;

import com.ecommerce.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

    List<AdminNotification> findTop30ByOrderByCreatedAtDesc();

    long countByReadFalse();

    List<AdminNotification> findByReadFalseOrderByCreatedAtDesc();
}
