package com.ecommerce.repository;

import com.ecommerce.entity.Segment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SegmentRepository extends JpaRepository<Segment, Long> {
    Optional<Segment> findByName(String name);

    boolean existsByName(String name);
}
