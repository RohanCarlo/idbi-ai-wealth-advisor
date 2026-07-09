package com.idbi.wealthadvisor.utils;

import com.idbi.wealthadvisor.entity.*;
import com.idbi.wealthadvisor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final GoalRepository goalRepository;
    private final FinancialHealthScoreRepository financialHealthScoreRepository;
    private final RiskProfileRepository riskProfileRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        if (userRepository.existsByEmail("rahul@demo.com")) {
            log.info("Demo data already exists, skipping seed");
            return;
        }

        log.info("Seeding demo data...");

        User user = userRepository.save(User.builder()
                .email("rahul@demo.com")
                .name("Rahul Sharma")
                .password(passwordEncoder.encode("demo123"))
                .role(Role.USER)
                .build());

        Account account = accountRepository.save(Account.builder()
                .user(user)
                .accountNumber("IDBI00123456")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("85000.00"))
                .currency("INR")
                .build());

        seedTransactions(account);
        seedGoals(user);

        financialHealthScoreRepository.save(FinancialHealthScore.builder()
                .user(user)
                .score(72)
                .savingsRate(new BigDecimal("18.50"))
                .debtRatio(new BigDecimal("22.30"))
                .investmentDiversityScore(55)
                .emergencyFundMonths(new BigDecimal("2.70"))
                .spendingDisciplineScore(65)
                .incomeStabilityScore(85)
                .build());

        riskProfileRepository.save(RiskProfile.builder()
                .user(user)
                .riskTolerance(RiskTolerance.MEDIUM)
                .investmentHorizonYears(10)
                .monthlyInvestmentCapacity(new BigDecimal("10000.00"))
                .build());

        log.info("Demo data seeded. Login: rahul@demo.com / demo123");
    }

    private void seedTransactions(Account account) {
        Object[][] txData = {
            // April 2026
            {"75000.00", "CREDIT", "Salary", "IDBI Bank", "Monthly Salary - April", "2026-04-01T09:00:00"},
            {"15000.00", "DEBIT", "EMI", "HDFC Bank", "Home Loan EMI", "2026-04-05T10:00:00"},
            {"3200.00", "DEBIT", "Bills & Utilities", "BESCOM", "Electricity Bill", "2026-04-07T11:00:00"},
            {"850.00", "DEBIT", "Bills & Utilities", "Jio", "Mobile Recharge", "2026-04-08T12:00:00"},
            {"4500.00", "DEBIT", "Groceries", "BigBasket", "Monthly Groceries", "2026-04-10T14:00:00"},
            {"2100.00", "DEBIT", "Food & Dining", "Swiggy", "Food Delivery", "2026-04-12T19:00:00"},
            {"5000.00", "DEBIT", "Investment", "Zerodha", "SIP - Nifty 50 Index", "2026-04-15T10:00:00"},
            {"1800.00", "DEBIT", "Transport", "Ola/Uber", "Cab Rides", "2026-04-16T08:00:00"},
            {"3500.00", "DEBIT", "Shopping", "Amazon", "Online Shopping", "2026-04-18T16:00:00"},
            {"12000.00", "DEBIT", "EMI", "Bajaj Finance", "Laptop EMI", "2026-04-20T10:00:00"},
            {"1200.00", "DEBIT", "Entertainment", "BookMyShow", "Movie Tickets", "2026-04-21T20:00:00"},
            {"8000.00", "CREDIT", "Freelance", "Client Payment", "Web Design Project", "2026-04-25T15:00:00"},
            {"2500.00", "DEBIT", "Healthcare", "Apollo Pharmacy", "Medicines", "2026-04-27T11:00:00"},
            // May 2026
            {"75000.00", "CREDIT", "Salary", "IDBI Bank", "Monthly Salary - May", "2026-05-01T09:00:00"},
            {"15000.00", "DEBIT", "EMI", "HDFC Bank", "Home Loan EMI", "2026-05-05T10:00:00"},
            {"3100.00", "DEBIT", "Bills & Utilities", "BESCOM", "Electricity Bill", "2026-05-07T11:00:00"},
            {"850.00", "DEBIT", "Bills & Utilities", "Jio", "Mobile Recharge", "2026-05-08T12:00:00"},
            {"5200.00", "DEBIT", "Groceries", "BigBasket", "Monthly Groceries", "2026-05-10T14:00:00"},
            {"3800.00", "DEBIT", "Food & Dining", "Zomato", "Food Delivery + Restaurant", "2026-05-13T20:00:00"},
            {"5000.00", "DEBIT", "Investment", "Zerodha", "SIP - Nifty 50 Index", "2026-05-15T10:00:00"},
            {"2200.00", "DEBIT", "Transport", "Petrol Station", "Fuel", "2026-05-16T08:00:00"},
            {"8500.00", "DEBIT", "Shopping", "Myntra", "Clothes - Sale", "2026-05-20T16:00:00"},
            {"12000.00", "DEBIT", "EMI", "Bajaj Finance", "Laptop EMI", "2026-05-20T10:00:00"},
            {"1500.00", "DEBIT", "Entertainment", "Netflix/Spotify", "Subscriptions", "2026-05-22T12:00:00"},
            {"4500.00", "CREDIT", "Freelance", "Client Payment", "Logo Design", "2026-05-28T15:00:00"},
            // June 2026
            {"75000.00", "CREDIT", "Salary", "IDBI Bank", "Monthly Salary - June", "2026-06-01T09:00:00"},
            {"15000.00", "DEBIT", "EMI", "HDFC Bank", "Home Loan EMI", "2026-06-05T10:00:00"},
            {"2900.00", "DEBIT", "Bills & Utilities", "BESCOM", "Electricity Bill", "2026-06-07T11:00:00"},
            {"850.00", "DEBIT", "Bills & Utilities", "Jio", "Mobile Recharge", "2026-06-08T12:00:00"},
            {"4800.00", "DEBIT", "Groceries", "BigBasket", "Monthly Groceries", "2026-06-10T14:00:00"},
            {"2600.00", "DEBIT", "Food & Dining", "Swiggy", "Food Delivery", "2026-06-14T19:00:00"},
            {"5000.00", "DEBIT", "Investment", "Zerodha", "SIP - Nifty 50 Index", "2026-06-15T10:00:00"},
            {"1600.00", "DEBIT", "Transport", "Metro Card", "Monthly Metro Pass", "2026-06-16T08:00:00"},
            {"12000.00", "DEBIT", "EMI", "Bajaj Finance", "Laptop EMI", "2026-06-20T10:00:00"},
            {"3200.00", "DEBIT", "Shopping", "Flipkart", "Electronics Accessories", "2026-06-22T16:00:00"},
            {"1500.00", "DEBIT", "Entertainment", "Netflix/Spotify", "Subscriptions", "2026-06-22T12:00:00"},
        };

        for (Object[] row : txData) {
            transactionRepository.save(Transaction.builder()
                    .account(account)
                    .amount(new BigDecimal((String) row[0]))
                    .type(TransactionType.valueOf((String) row[1]))
                    .categoryName((String) row[2])
                    .merchant((String) row[3])
                    .description((String) row[4])
                    .transactionDate(LocalDateTime.parse((String) row[5]))
                    .build());
        }
    }

    private void seedGoals(User user) {
        goalRepository.save(Goal.builder()
                .user(user)
                .name("Buy a Car")
                .description("Down payment for Maruti Suzuki Swift")
                .targetAmount(new BigDecimal("300000.00"))
                .currentAmount(new BigDecimal("85000.00"))
                .deadline(java.time.LocalDate.of(2027, 6, 30))
                .status(GoalStatus.ACTIVE)
                .build());

        goalRepository.save(Goal.builder()
                .user(user)
                .name("Emergency Fund")
                .description("6 months of expenses buffer")
                .targetAmount(new BigDecimal("200000.00"))
                .currentAmount(new BigDecimal("45000.00"))
                .deadline(java.time.LocalDate.of(2026, 12, 31))
                .status(GoalStatus.ACTIVE)
                .build());

        goalRepository.save(Goal.builder()
                .user(user)
                .name("Europe Vacation")
                .description("Euro trip with family")
                .targetAmount(new BigDecimal("150000.00"))
                .currentAmount(new BigDecimal("15000.00"))
                .deadline(java.time.LocalDate.of(2027, 12, 31))
                .status(GoalStatus.ACTIVE)
                .build());
    }
}
