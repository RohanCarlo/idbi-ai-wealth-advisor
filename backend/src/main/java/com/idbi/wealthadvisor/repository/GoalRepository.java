package com.idbi.wealthadvisor.repository;

import com.idbi.wealthadvisor.entity.Goal;
import com.idbi.wealthadvisor.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Goal> findByUserIdAndStatus(UUID userId, GoalStatus status);
}
