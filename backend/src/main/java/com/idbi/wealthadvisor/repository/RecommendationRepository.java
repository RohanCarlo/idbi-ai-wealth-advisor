package com.idbi.wealthadvisor.repository;

import com.idbi.wealthadvisor.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {
    List<Recommendation> findByUserIdAndStatusOrderByPriorityAsc(UUID userId, String status);
    List<Recommendation> findByUserIdOrderByPriorityAsc(UUID userId);

    @Modifying
    @Query("DELETE FROM Recommendation r WHERE r.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);
}
