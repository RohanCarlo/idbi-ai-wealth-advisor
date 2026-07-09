package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.dto.RecommendationDto;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getRecommendations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.getRecommendations(user)));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> generate(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Recommendations generated",
                recommendationService.generate(user)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RecommendationDto>> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "DISMISSED");
        return ResponseEntity.ok(ApiResponse.success(recommendationService.updateStatus(user, id, status)));
    }
}
