package com.ecommerce.repository;

import com.ecommerce.entity.TvaRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TvaRateRepository extends JpaRepository<TvaRate, Long> {
    List<TvaRate> findAllByOrderByIdAsc();

    long countByActifTrue();
}
