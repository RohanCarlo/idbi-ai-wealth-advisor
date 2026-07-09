package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record GoalDto(
    UUID id,
    String name,
    String description,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    LocalDate deadline,
    String status,
    LocalDateTime createdAt
) {}
