package com.idbi.wealthadvisor.utils;

import com.idbi.wealthadvisor.entity.FinancialHealthScore;
import com.idbi.wealthadvisor.entity.Transaction;
import com.idbi.wealthadvisor.entity.TransactionType;
import com.idbi.wealthadvisor.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class FinancialScoreCalculator {

    public FinancialHealthScore calculate(User user, List<Transaction> allTransactions, BigDecimal accountBalance) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<Transaction> currentMonthTxs = allTransactions.stream()
                .filter(t -> !t.getTransactionDate().isBefore(monthStart))
                .toList();

        BigDecimal income = sumByType(currentMonthTxs, TransactionType.CREDIT);
        BigDecimal expenses = sumByType(currentMonthTxs, TransactionType.DEBIT);

        // Savings rate
        BigDecimal savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? income.subtract(expenses).divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Debt ratio (EMI / income)
        BigDecimal emiPayments = currentMonthTxs.stream()
                .filter(t -> t.getType() == TransactionType.DEBIT && isEmi(t.getCategoryName()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal debtRatio = income.compareTo(BigDecimal.ZERO) > 0
                ? emiPayments.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Emergency fund (account balance / avg monthly expenses)
        BigDecimal avgExpenses = expenses.compareTo(BigDecimal.ZERO) > 0 ? expenses : BigDecimal.valueOf(30000);
        BigDecimal emergencyFundMonths = accountBalance.divide(avgExpenses, 2, RoundingMode.HALF_UP);

        // Has recurring investments
        boolean hasInvestments = allTransactions.stream()
                .anyMatch(t -> t.getType() == TransactionType.DEBIT && isInvestment(t.getCategoryName()));

        // Has stable salary
        long salaryMonths = allTransactions.stream()
                .filter(t -> t.getType() == TransactionType.CREDIT && isSalary(t.getCategoryName()))
                .map(t -> t.getTransactionDate().getMonth())
                .distinct().count();

        // Component scores
        int savingsScore       = scoreSavingsRate(savingsRate.doubleValue());       // 0-25
        int emergencyScore     = scoreEmergencyFund(emergencyFundMonths.doubleValue()); // 0-25
        int debtScore          = scoreDebtRatio(debtRatio.doubleValue());           // 0-20
        int investmentScore    = hasInvestments ? 15 : 0;                           // 0-15
        int incomeStability    = (int) Math.min(100, salaryMonths >= 3 ? 85 : salaryMonths >= 1 ? 60 : 30);
        int spendingDiscipline = scoreSpendingDiscipline(savingsRate.doubleValue());

        int total = savingsScore + emergencyScore + debtScore + investmentScore +
                    (int) Math.round((incomeStability / 10.0) + (spendingDiscipline / 10.0));
        total = Math.min(100, Math.max(0, total));

        return FinancialHealthScore.builder()
                .user(user)
                .score(total)
                .savingsRate(savingsRate.setScale(2, RoundingMode.HALF_UP))
                .debtRatio(debtRatio.setScale(2, RoundingMode.HALF_UP))
                .investmentDiversityScore(hasInvestments ? 70 : 20)
                .emergencyFundMonths(emergencyFundMonths.min(BigDecimal.valueOf(12)).setScale(2, RoundingMode.HALF_UP))
                .spendingDisciplineScore(spendingDiscipline)
                .incomeStabilityScore(incomeStability)
                .build();
    }

    public BigDecimal sumByType(List<Transaction> txs, TransactionType type) {
        return txs.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isEmi(String category) {
        return category != null && category.toLowerCase().contains("emi");
    }

    private boolean isInvestment(String category) {
        return category != null && (category.toLowerCase().contains("investment") ||
                category.toLowerCase().contains("sip") ||
                category.toLowerCase().contains("mutual"));
    }

    private boolean isSalary(String category) {
        return category != null && category.toLowerCase().contains("salary");
    }

    private int scoreSavingsRate(double rate) {
        if (rate >= 30) return 25;
        if (rate >= 20) return 20;
        if (rate >= 10) return 15;
        if (rate >= 5)  return 8;
        return 3;
    }

    private int scoreEmergencyFund(double months) {
        if (months >= 6) return 25;
        if (months >= 3) return 18;
        if (months >= 1) return 10;
        return 3;
    }

    private int scoreDebtRatio(double ratio) {
        if (ratio <= 15) return 20;
        if (ratio <= 25) return 15;
        if (ratio <= 35) return 10;
        if (ratio <= 45) return 5;
        return 0;
    }

    private int scoreSpendingDiscipline(double savingsRate) {
        if (savingsRate >= 30) return 85;
        if (savingsRate >= 20) return 70;
        if (savingsRate >= 10) return 55;
        return 35;
    }
}
