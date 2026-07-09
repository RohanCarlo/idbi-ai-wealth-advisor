package com.idbi.wealthadvisor.dto;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String name,
    String role
) {}
