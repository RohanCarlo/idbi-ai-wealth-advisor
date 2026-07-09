package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.AnalyticsSummaryDto;
import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.dto.FinancialHealthScoreDto;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSummary(user)));
    }

    @GetMapping("/financial-score")
    public ResponseEntity<ApiResponse<FinancialHealthScoreDto>> getFinancialScore(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getLatestHealthScore(user)));
    }

    @PostMapping("/recalculate-score")
    public ResponseEntity<ApiResponse<FinancialHealthScoreDto>> recalculate(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.recalculateScore(user)));
    }
}
