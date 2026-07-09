package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;

public record MonthlyTrendDto(
    String month,
    BigDecimal income,
    BigDecimal expenses,
    BigDecimal savings
) {}
