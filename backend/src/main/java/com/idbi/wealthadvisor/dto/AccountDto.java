package com.idbi.wealthadvisor.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountDto(
    UUID id,
    String accountNumber,
    String accountType,
    BigDecimal balance,
    String currency
) {}
