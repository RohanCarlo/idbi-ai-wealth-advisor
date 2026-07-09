package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RecommendationDto(
    UUID id,
    String type,
    String title,
    String description,
    String instrument,
    BigDecimal suggestedMonthlyAmount,
    String expectedReturn,
    Integer priority,
    String status,
    LocalDateTime createdAt
) {}
