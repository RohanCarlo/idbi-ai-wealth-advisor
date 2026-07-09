package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record FinancialHealthScoreDto(
    UUID id,
    Integer score,
    BigDecimal savingsRate,
    BigDecimal debtRatio,
    Integer investmentDiversityScore,
    BigDecimal emergencyFundMonths,
    Integer spendingDisciplineScore,
    Integer incomeStabilityScore,
    LocalDateTime calculatedAt
) {}
