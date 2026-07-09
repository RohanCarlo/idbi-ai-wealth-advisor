package com.idbi.wealthadvisor.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalRequest(
    @NotBlank(message = "Goal name is required")
    String name,

    String description,

    @NotNull(message = "Target amount is required")
    @Positive(message = "Target amount must be positive")
    BigDecimal targetAmount,

    BigDecimal currentAmount,

    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be in the future")
    LocalDate deadline
) {}
