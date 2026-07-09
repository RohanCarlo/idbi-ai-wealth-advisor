package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.dto.CreateGoalRequest;
import com.idbi.wealthadvisor.dto.GoalDto;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.GoalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
@Tag(name = "Goals")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalDto>>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoals(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalDto>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created", goalService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> update(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(goalService.update(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        goalService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted", null));
    }
}
