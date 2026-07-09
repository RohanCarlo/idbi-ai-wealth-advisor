package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionDto(
    UUID id,
    BigDecimal amount,
    String type,
    String categoryName,
    String merchant,
    String description,
    LocalDateTime transactionDate
) {}
