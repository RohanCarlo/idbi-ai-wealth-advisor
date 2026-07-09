package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.CreateGoalRequest;
import com.idbi.wealthadvisor.dto.GoalDto;
import com.idbi.wealthadvisor.entity.Goal;
import com.idbi.wealthadvisor.entity.GoalStatus;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.exception.ResourceNotFoundException;
import com.idbi.wealthadvisor.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    public List<GoalDto> getGoals(User user) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public GoalDto create(User user, CreateGoalRequest request) {
        Goal goal = goalRepository.save(Goal.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .targetAmount(request.targetAmount())
                .currentAmount(request.currentAmount() != null ? request.currentAmount() : BigDecimal.ZERO)
                .deadline(request.deadline())
                .status(GoalStatus.ACTIVE)
                .build());
        return toDto(goal);
    }

    @Transactional
    public GoalDto update(User user, UUID goalId, CreateGoalRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goal.setName(request.name());
        goal.setDescription(request.description());
        goal.setTargetAmount(request.targetAmount());
        if (request.currentAmount() != null) goal.setCurrentAmount(request.currentAmount());
        goal.setDeadline(request.deadline());
        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public void delete(User user, UUID goalId) {
        Goal goal = goalRepository.findById(goalId)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalDto toDto(Goal g) {
        return new GoalDto(g.getId(), g.getName(), g.getDescription(),
                g.getTargetAmount(), g.getCurrentAmount(), g.getDeadline(),
                g.getStatus().name(), g.getCreatedAt());
    }
}
