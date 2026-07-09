package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.*;
import com.idbi.wealthadvisor.entity.*;
import com.idbi.wealthadvisor.exception.ResourceNotFoundException;
import com.idbi.wealthadvisor.repository.*;
import com.idbi.wealthadvisor.utils.FinancialScoreCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final FinancialHealthScoreRepository scoreRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FinancialScoreCalculator calculator;

    public FinancialHealthScoreDto getLatestHealthScore(User user) {
        FinancialHealthScore score = scoreRepository
                .findTopByUserIdOrderByCalculatedAtDesc(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Financial health score not found"));
        return toDto(score);
    }

    @Transactional
    public FinancialHealthScoreDto recalculateScore(User user) {
        List<Transaction> last3Months = transactionRepository.findByUserIdAndDateRange(
                user.getId(),
                LocalDateTime.now().minusMonths(3),
                LocalDateTime.now().plusDays(1)
        );

        BigDecimal balance = accountRepository.findByUserId(user.getId()).stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        FinancialHealthScore newScore = calculator.calculate(user, last3Months, balance);
        newScore = scoreRepository.save(newScore);
        return toDto(newScore);
    }

    public AnalyticsSummaryDto getSummary(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime currentMonthEnd = currentMonthStart.plusMonths(1);
        LocalDateTime lastMonthStart = currentMonthStart.minusMonths(1);
        LocalDateTime sixMonthsAgo = currentMonthStart.minusMonths(5);

        List<Transaction> currentMonthTxs = transactionRepository.findByUserIdAndDateRange(
                user.getId(), currentMonthStart, currentMonthEnd);
        List<Transaction> lastMonthTxs = transactionRepository.findByUserIdAndDateRange(
                user.getId(), lastMonthStart, currentMonthStart);
        List<Transaction> last6MonthsTxs = transactionRepository.findByUserIdAndDateRange(
                user.getId(), sixMonthsAgo, currentMonthEnd);

        BigDecimal currentIncome = calculator.sumByType(currentMonthTxs, TransactionType.CREDIT);
        BigDecimal currentExpenses = calculator.sumByType(currentMonthTxs, TransactionType.DEBIT);
        BigDecimal currentSavings = currentIncome.subtract(currentExpenses);
        BigDecimal currentSavingsRate = currentIncome.compareTo(BigDecimal.ZERO) > 0
                ? currentSavings.divide(currentIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal lastIncome = calculator.sumByType(lastMonthTxs, TransactionType.CREDIT);
        BigDecimal lastExpenses = calculator.sumByType(lastMonthTxs, TransactionType.DEBIT);

        BigDecimal incomeChange = percentChange(lastIncome, currentIncome);
        BigDecimal expenseChange = percentChange(lastExpenses, currentExpenses);

        BigDecimal totalBalance = accountRepository.findByUserId(user.getId()).stream()
                .map(Account::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SpendingCategoryDto> spendingByCategory = buildCategoryBreakdown(currentMonthTxs);
        List<MonthlyTrendDto> trends = buildMonthlyTrends(last6MonthsTxs, sixMonthsAgo, now);
        List<String> insights = buildInsights(currentIncome, currentExpenses, currentSavingsRate,
                lastExpenses, spendingByCategory);

        return new AnalyticsSummaryDto(
                currentIncome, currentExpenses, currentSavings,
                currentSavingsRate.setScale(2, RoundingMode.HALF_UP),
                lastIncome, lastExpenses, incomeChange, expenseChange,
                totalBalance, spendingByCategory, trends, insights
        );
    }

    private List<SpendingCategoryDto> buildCategoryBreakdown(List<Transaction> txs) {
        BigDecimal totalExpenses = txs.stream()
                .filter(t -> t.getType() == TransactionType.DEBIT)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return txs.stream()
                .filter(t -> t.getType() == TransactionType.DEBIT)
                .collect(Collectors.groupingBy(
                        t -> t.getCategoryName() != null ? t.getCategoryName() : "Other",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(e -> new SpendingCategoryDto(
                        e.getKey(),
                        e.getValue(),
                        totalExpenses.compareTo(BigDecimal.ZERO) > 0
                                ? e.getValue().divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO
                ))
                .toList();
    }

    private List<MonthlyTrendDto> buildMonthlyTrends(List<Transaction> txs, LocalDateTime from, LocalDateTime to) {
        Map<String, List<Transaction>> byMonth = txs.stream()
                .collect(Collectors.groupingBy(t ->
                        t.getTransactionDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                        + " " + t.getTransactionDate().getYear()
                ));

        List<MonthlyTrendDto> trends = new ArrayList<>();
        LocalDateTime cursor = from;
        while (!cursor.isAfter(to)) {
            String key = cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + cursor.getYear();
            String label = cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            List<Transaction> month = byMonth.getOrDefault(key, List.of());
            BigDecimal inc = calculator.sumByType(month, TransactionType.CREDIT);
            BigDecimal exp = calculator.sumByType(month, TransactionType.DEBIT);
            trends.add(new MonthlyTrendDto(label, inc, exp, inc.subtract(exp)));
            cursor = cursor.plusMonths(1);
        }
        return trends;
    }

    private List<String> buildInsights(BigDecimal income, BigDecimal expenses, BigDecimal savingsRate,
                                        BigDecimal lastExpenses, List<SpendingCategoryDto> categories) {
        List<String> insights = new ArrayList<>();

        if (savingsRate.compareTo(BigDecimal.valueOf(20)) >= 0) {
            insights.add("Your savings rate of " + savingsRate.setScale(1, RoundingMode.HALF_UP) + "% is excellent. Keep it up!");
        } else if (savingsRate.compareTo(BigDecimal.ZERO) > 0) {
            insights.add("Your savings rate is " + savingsRate.setScale(1, RoundingMode.HALF_UP) + "%. Target 20% for better financial health.");
        }

        if (!lastExpenses.equals(BigDecimal.ZERO) && expenses.compareTo(lastExpenses) > 0) {
            BigDecimal increase = expenses.subtract(lastExpenses);
            insights.add("Expenses increased by ₹" + increase.setScale(0, RoundingMode.HALF_UP).toPlainString() + " vs last month. Review discretionary spending.");
        }

        if (!categories.isEmpty()) {
            SpendingCategoryDto top = categories.get(0);
            if (top.percentage().compareTo(BigDecimal.valueOf(30)) > 0) {
                insights.add(top.name() + " is your biggest expense at " + top.percentage() + "% of spending (₹" +
                        top.amount().setScale(0, RoundingMode.HALF_UP).toPlainString() + ").");
            }
        }

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            boolean hasInvestment = categories.stream()
                    .anyMatch(c -> c.name().toLowerCase().contains("investment") || c.name().toLowerCase().contains("sip"));
            if (!hasInvestment) {
                insights.add("You haven't invested this month. Consider starting a SIP to build long-term wealth.");
            }
        }

        return insights;
    }

    private BigDecimal percentChange(BigDecimal old, BigDecimal current) {
        if (old.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return current.subtract(old).divide(old, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP);
    }

    private FinancialHealthScoreDto toDto(FinancialHealthScore s) {
        return new FinancialHealthScoreDto(
                s.getId(), s.getScore(), s.getSavingsRate(), s.getDebtRatio(),
                s.getInvestmentDiversityScore(), s.getEmergencyFundMonths(),
                s.getSpendingDisciplineScore(), s.getIncomeStabilityScore(), s.getCalculatedAt()
        );
    }
}
