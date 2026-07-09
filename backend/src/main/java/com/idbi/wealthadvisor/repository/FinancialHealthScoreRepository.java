package com.idbi.wealthadvisor.repository;

import com.idbi.wealthadvisor.entity.FinancialHealthScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FinancialHealthScoreRepository extends JpaRepository<FinancialHealthScore, UUID> {
    Optional<FinancialHealthScore> findTopByUserIdOrderByCalculatedAtDesc(UUID userId);
}
