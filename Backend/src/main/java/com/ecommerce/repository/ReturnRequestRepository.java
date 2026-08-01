package com.ecommerce.repository;

import com.ecommerce.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();

    List<ReturnRequest> findByCustomerEmailOrderByCreatedAtDesc(String email);

    boolean existsByOrderIdAndOrderItemId(Long orderId, Long orderItemId);
}
