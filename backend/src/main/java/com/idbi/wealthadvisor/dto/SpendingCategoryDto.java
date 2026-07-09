package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;

public record SpendingCategoryDto(
    String name,
    BigDecimal amount,
    BigDecimal percentage
) {}
