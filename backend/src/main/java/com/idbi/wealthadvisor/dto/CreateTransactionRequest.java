package com.idbi.wealthadvisor.dto;

import com.idbi.wealthadvisor.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateTransactionRequest(
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    BigDecimal amount,

    @NotNull(message = "Transaction type is required")
    TransactionType type,

    String categoryName,
    String merchant,
    String description,
    LocalDateTime transactionDate
) {
    public LocalDateTime effectiveDate() {
        return transactionDate != null ? transactionDate : LocalDateTime.now();
    }
}
