package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.entity.ChatMessage;
import com.idbi.wealthadvisor.entity.MessageRole;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${ai-service.url}")
    private String aiServiceUrl;

    public Map<String, Object> chat(User user, Map<String, Object> request) {
        String userMessage = (String) request.getOrDefault("message", "");
        String sessionId = (String) request.getOrDefault("session_id", "default");

        // Persist user message
        chatMessageRepository.save(ChatMessage.builder()
                .user(user)
                .sessionId(sessionId)
                .role(MessageRole.USER)
                .content(userMessage)
                .build());

        // Forward to AI service
        try {
            Map<?, ?> aiResponse = webClientBuilder.build()
                    .post()
                    .uri(aiServiceUrl + "/chat")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String responseText = aiResponse != null ? (String) aiResponse.get("response") : "I'm unable to process that right now.";

            // Persist AI response
            chatMessageRepository.save(ChatMessage.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(responseText)
                    .build());

            return Map.of("response", responseText, "session_id", sessionId);
        } catch (Exception e) {
            log.error("AI service call failed", e);
            return Map.of("response", "I'm having trouble connecting to the AI service. Please try again.", "session_id", sessionId);
        }
    }

    public List<Map<String, Object>> getHistory(User user, String sessionId) {
        List<ChatMessage> messages = sessionId != null
                ? chatMessageRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(user.getId(), sessionId)
                : chatMessageRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());

        return messages.stream()
                .map(m -> Map.<String, Object>of(
                        "id", m.getId().toString(),
                        "role", m.getRole().name(),
                        "content", m.getContent(),
                        "createdAt", m.getCreatedAt().toString()
                ))
                .toList();
    }
}
