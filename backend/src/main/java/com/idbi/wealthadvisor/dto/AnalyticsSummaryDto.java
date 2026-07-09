package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsSummaryDto(
    BigDecimal monthlyIncome,
    BigDecimal monthlyExpenses,
    BigDecimal monthlySavings,
    BigDecimal savingsRate,
    BigDecimal lastMonthIncome,
    BigDecimal lastMonthExpenses,
    BigDecimal incomeChangePercent,
    BigDecimal expenseChangePercent,
    BigDecimal accountBalance,
    List<SpendingCategoryDto> spendingByCategory,
    List<MonthlyTrendDto> monthlyTrends,
    List<String> insights
) {}
