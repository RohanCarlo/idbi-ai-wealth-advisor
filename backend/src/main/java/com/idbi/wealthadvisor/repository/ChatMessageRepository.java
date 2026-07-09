package com.idbi.wealthadvisor.repository;

import com.idbi.wealthadvisor.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByUserIdAndSessionIdOrderByCreatedAtAsc(UUID userId, String sessionId);
    List<ChatMessage> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);
}
