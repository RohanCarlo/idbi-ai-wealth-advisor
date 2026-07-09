package com.idbi.wealthadvisor.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    String type,
    String title,
    String message,
    Boolean read,
    LocalDateTime createdAt
) {}
