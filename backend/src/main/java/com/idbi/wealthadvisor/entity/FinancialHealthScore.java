package com.idbi.wealthadvisor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "financial_health_scores", indexes = {
    @Index(name = "idx_financial_scores_user", columnList = "user_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialHealthScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "savings_rate", precision = 5, scale = 2)
    private BigDecimal savingsRate;

    @Column(name = "debt_ratio", precision = 5, scale = 2)
    private BigDecimal debtRatio;

    @Column(name = "investment_diversity_score")
    private Integer investmentDiversityScore;

    @Column(name = "emergency_fund_months", precision = 5, scale = 2)
    private BigDecimal emergencyFundMonths;

    @Column(name = "spending_discipline_score")
    private Integer spendingDisciplineScore;

    @Column(name = "income_stability_score")
    private Integer incomeStabilityScore;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
