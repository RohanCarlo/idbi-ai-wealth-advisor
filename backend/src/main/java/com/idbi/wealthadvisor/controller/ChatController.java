package com.idbi.wealthadvisor.controller;

import com.idbi.wealthadvisor.dto.ApiResponse;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatService.chat(user, request)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Object>> getHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String sessionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getHistory(user, sessionId)));
    }
}
