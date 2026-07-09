package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.AccountDto;
import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountDto>>> getAccounts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccounts(user)));
    }
}
