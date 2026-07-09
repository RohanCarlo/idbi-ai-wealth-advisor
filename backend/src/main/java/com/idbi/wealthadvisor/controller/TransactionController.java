package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.dto.CreateTransactionRequest;
import com.idbi.wealthadvisor.dto.TransactionDto;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionDto>>> getTransactions(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getTransactions(user, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDto>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created", transactionService.create(user, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        transactionService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted", null));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getCategories()));
    }
}
