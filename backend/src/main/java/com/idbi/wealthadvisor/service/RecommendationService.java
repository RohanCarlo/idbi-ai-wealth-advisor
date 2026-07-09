package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.RecommendationDto;
import com.idbi.wealthadvisor.entity.*;
import com.idbi.wealthadvisor.repository.*;
import com.idbi.wealthadvisor.utils.FinancialScoreCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final FinancialHealthScoreRepository scoreRepository;
    private final RiskProfileRepository riskProfileRepository;
    private final FinancialScoreCalculator calculator;

    public List<RecommendationDto> getRecommendations(User user) {
        List<Recommendation> recs = recommendationRepository
                .findByUserIdOrderByPriorityAsc(user.getId());
        if (recs.isEmpty()) {
            return generate(user);
        }
        return recs.stream().map(this::toDto).toList();
    }

    @Transactional
    public List<RecommendationDto> generate(User user) {
        // Clear old recommendations
        recommendationRepository.deleteAllByUserId(user.getId());

        // Gather context
        BigDecimal balance = accountRepository.findByUserId(user.getId()).stream()
                .map(Account::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime monthEnd = monthStart.plusMonths(1);
        List<Transaction> last3Months = transactionRepository.findByUserIdAndDateRange(
                user.getId(), LocalDateTime.now().minusMonths(3), monthEnd);

        List<Transaction> currentMonth = last3Months.stream()
                .filter(t -> !t.getTransactionDate().isBefore(monthStart)).toList();

        BigDecimal monthlyIncome = calculator.sumByType(currentMonth, TransactionType.CREDIT);
        BigDecimal monthlyExpenses = calculator.sumByType(currentMonth, TransactionType.DEBIT);
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);

        BigDecimal emergencyFundMonths = monthlyExpenses.compareTo(BigDecimal.ZERO) > 0
                ? balance.divide(monthlyExpenses, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal savingsRate = monthlyIncome.compareTo(BigDecimal.ZERO) > 0
                ? monthlySavings.divide(monthlyIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        RiskTolerance risk = riskProfileRepository.findByUserId(user.getId())
                .map(RiskProfile::getRiskTolerance)
                .orElse(RiskTolerance.MEDIUM);

        List<Goal> goals = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.ACTIVE);

        List<Recommendation> recs = new ArrayList<>();
        int priority = 1;

        // 1. Emergency fund (always first priority if insufficient)
        if (emergencyFundMonths.compareTo(BigDecimal.valueOf(3)) < 0) {
            BigDecimal target = monthlyExpenses.multiply(BigDecimal.valueOf(6));
            BigDecimal needed = target.subtract(balance).max(BigDecimal.ZERO);
            BigDecimal monthly = needed.divide(BigDecimal.valueOf(12), 0, RoundingMode.CEILING);
            recs.add(build(user, priority++, "SAVINGS",
                    "Build Your Emergency Fund",
                    "Your emergency fund covers only " + emergencyFundMonths.setScale(1, RoundingMode.HALF_UP) + " months of expenses. "
                    + "Financial experts recommend 6 months. Transfer ₹" + fmt(monthly) + "/month to a liquid fund or savings account "
                    + "until you reach ₹" + fmt(target) + ". This is your financial safety net before any other investment.",
                    "LIQUID_FUND", monthly, "4-5% p.a."));
        }

        // 2. Tax saving (ELSS) - if income > 5L annually
        if (monthlyIncome.compareTo(BigDecimal.valueOf(41667)) >= 0) {
            BigDecimal elssAmount = monthlySavings.multiply(BigDecimal.valueOf(0.25)).max(BigDecimal.valueOf(1500));
            recs.add(build(user, priority++, "TAX_SAVING",
                    "Save Tax with ELSS",
                    "Investing up to ₹1,50,000/year in ELSS Mutual Funds qualifies for 80C tax deduction, saving you "
                    + "₹46,800 in taxes (30% bracket). With only a 3-year lock-in (shortest in 80C category), ELSS also "
                    + "delivers superior returns vs PPF. Recommended: Mirae Asset ELSS, Parag Parikh ELSS.",
                    "ELSS", elssAmount.setScale(0, RoundingMode.CEILING), "12-15% p.a."));
        }

        // 3. SIP recommendation based on risk profile
        if (monthlySavings.compareTo(BigDecimal.valueOf(2000)) > 0) {
            BigDecimal sipAmount = monthlySavings.multiply(BigDecimal.valueOf(0.5)).setScale(0, RoundingMode.FLOOR);
            // Round to nearest 500
            sipAmount = sipAmount.divide(BigDecimal.valueOf(500), 0, RoundingMode.FLOOR).multiply(BigDecimal.valueOf(500));

            String instrument, title, desc, returns;
            if (risk == RiskTolerance.HIGH) {
                instrument = "EQUITY_MF";
                title = "SIP in Small/Mid-Cap Equity Fund";
                desc = "With your HIGH risk tolerance and long investment horizon, allocate ₹" + fmt(sipAmount)
                        + "/month in a diversified small-cap fund. Over 10 years at 15% CAGR, this grows to ₹"
                        + fmt(futureValue(sipAmount, 0.15, 120)) + ". Recommended: Nippon India Small Cap, HDFC Mid-Cap Opportunities.";
                returns = "13-18% p.a.";
            } else if (risk == RiskTolerance.LOW) {
                instrument = "DEBT_FUND";
                title = "Debt Mutual Fund SIP";
                desc = "Your LOW risk profile calls for capital protection. Invest ₹" + fmt(sipAmount)
                        + "/month in a short-duration debt fund — better post-tax returns than FDs with similar safety. "
                        + "Recommended: HDFC Short Duration Fund, Kotak Banking & PSU Debt Fund.";
                returns = "6-8% p.a.";
            } else {
                instrument = "INDEX_FUND";
                title = "SIP in Nifty 50 Index Fund";
                desc = "The simplest, lowest-cost path to wealth. Invest ₹" + fmt(sipAmount) + "/month in a Nifty 50 index fund. "
                        + "Over 10 years at 12% CAGR, this grows to ₹" + fmt(futureValue(sipAmount, 0.12, 120)) + ". "
                        + "Zero manager bias, expense ratio < 0.1%. Recommended: UTI Nifty 50 Index, HDFC Index Fund Nifty 50.";
                returns = "10-13% p.a.";
            }
            recs.add(build(user, priority++, "INVESTMENT", title, desc, instrument, sipAmount, returns));
        }

        // 4. PPF (long-term, safe)
        if (risk != RiskTolerance.HIGH && monthlyIncome.compareTo(BigDecimal.valueOf(25000)) > 0) {
            recs.add(build(user, priority++, "INVESTMENT",
                    "Contribute to PPF",
                    "Public Provident Fund (PPF) offers 7.1% tax-free returns with EEE tax status (Exempt-Exempt-Exempt). "
                    + "Deposit ₹500-1,500/month for 15 years. The compounding effect + tax-free maturity makes it ideal "
                    + "for long-term goals like retirement or children's education.",
                    "PPF", BigDecimal.valueOf(1000), "7.1% tax-free"));
        }

        // 5. NPS for retirement
        if (monthlyIncome.compareTo(BigDecimal.valueOf(50000)) >= 0) {
            recs.add(build(user, priority++, "RETIREMENT",
                    "Start NPS for Retirement + Extra 80CCD Deduction",
                    "NPS gives an additional ₹50,000 deduction under 80CCD(1B) beyond the 80C limit. "
                    + "Even ₹2,000/month builds a substantial retirement corpus over decades. "
                    + "Choose 75% equity allocation (auto-choice) for maximum growth if you're under 40.",
                    "NPS", BigDecimal.valueOf(2000), "8-10% p.a."));
        }

        // 6. Goal-specific recommendations
        for (Goal goal : goals.stream().limit(2).toList()) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                    java.time.LocalDate.now(), goal.getDeadline());
            BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
            BigDecimal monthlyNeeded = daysLeft > 0
                    ? remaining.divide(BigDecimal.valueOf(daysLeft / 30.0), 0, RoundingMode.CEILING)
                    : BigDecimal.ZERO;
            boolean feasible = monthlyNeeded.compareTo(monthlySavings) <= 0;
            String instrument2 = daysLeft < 365 * 3 ? "LIQUID_FUND" : daysLeft < 365 * 7 ? "HYBRID_FUND" : "EQUITY_MF";
            String instrName = daysLeft < 365 * 3 ? "liquid/short-term debt fund" : daysLeft < 365 * 7 ? "hybrid balanced fund" : "equity SIP";
            recs.add(build(user, priority++, "GOAL",
                    "Fund: " + goal.getName(),
                    (feasible
                            ? "Great news! You need ₹" + fmt(monthlyNeeded) + "/month to achieve '" + goal.getName()
                            + "' by " + goal.getDeadline() + ". Your current savings easily cover this. "
                            : "You need ₹" + fmt(monthlyNeeded) + "/month for '" + goal.getName()
                            + "' by " + goal.getDeadline() + " — that's ₹" + fmt(monthlyNeeded.subtract(monthlySavings))
                            + " more than your current savings. Consider extending the deadline or reducing other expenses. ")
                            + "Best instrument for this timeline: " + instrName + ".",
                    instrument2, monthlyNeeded, daysLeft < 365 * 3 ? "4-6% p.a." : "8-12% p.a."));
        }

        List<Recommendation> saved = recommendationRepository.saveAll(recs);

        // Auto-generate notifications
        generateNotifications(user, balance, emergencyFundMonths, savingsRate, monthlyExpenses);

        return saved.stream().map(this::toDto).toList();
    }

    @Transactional
    public RecommendationDto updateStatus(User user, UUID id, String status) {
        Recommendation rec = recommendationRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        rec.setStatus(status);
        return toDto(recommendationRepository.save(rec));
    }

    private void generateNotifications(User user, BigDecimal balance, BigDecimal emergencyMonths,
                                        BigDecimal savingsRate, BigDecimal monthlyExpenses) {
        notificationRepository.deleteAll(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));

        List<Notification> notes = new ArrayList<>();

        if (emergencyMonths.compareTo(BigDecimal.valueOf(1)) < 0) {
            notes.add(Notification.builder().user(user).type("ALERT")
                    .title("Emergency Fund Critical")
                    .message("Your emergency fund covers less than 1 month of expenses. Build it to 6 months before any investment.")
                    .build());
        }

        if (savingsRate.compareTo(BigDecimal.valueOf(20)) >= 0) {
            notes.add(Notification.builder().user(user).type("MILESTONE")
                    .title("Savings Rate Milestone!")
                    .message("Excellent! Your savings rate is " + savingsRate.setScale(1, RoundingMode.HALF_UP) + "% — above the recommended 20% threshold.")
                    .build());
        } else if (savingsRate.compareTo(BigDecimal.ZERO) > 0 && savingsRate.compareTo(BigDecimal.valueOf(10)) < 0) {
            notes.add(Notification.builder().user(user).type("WARNING")
                    .title("Low Savings Rate")
                    .message("Your savings rate of " + savingsRate.setScale(1, RoundingMode.HALF_UP) + "% is below 10%. Aim for 20% to build wealth.")
                    .build());
        }

        notes.add(Notification.builder().user(user).type("INSIGHT")
                .title("Monthly Analysis Ready")
                .message("Your personalized recommendations have been updated based on your latest transactions.")
                .build());

        notificationRepository.saveAll(notes);
    }

    private Recommendation build(User user, int priority, String type, String title,
                                  String description, String instrument,
                                  BigDecimal monthlyAmount, String returns) {
        return Recommendation.builder()
                .user(user).type(type).title(title).description(description)
                .instrument(instrument).suggestedMonthlyAmount(monthlyAmount)
                .expectedReturn(returns).priority(priority).status("ACTIVE")
                .build();
    }

    private BigDecimal futureValue(BigDecimal monthlyAmount, double annualRate, int months) {
        double r = annualRate / 12;
        double fv = monthlyAmount.doubleValue() * (Math.pow(1 + r, months) - 1) / r * (1 + r);
        return BigDecimal.valueOf(fv).setScale(0, RoundingMode.HALF_UP);
    }

    private String fmt(BigDecimal n) {
        return String.format("%,.0f", n.doubleValue());
    }

    private RecommendationDto toDto(Recommendation r) {
        return new RecommendationDto(r.getId(), r.getType(), r.getTitle(), r.getDescription(),
                r.getInstrument(), r.getSuggestedMonthlyAmount(), r.getExpectedReturn(),
                r.getPriority(), r.getStatus(), r.getCreatedAt());
    }
}
