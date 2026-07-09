package com.idbi.wealthadvisor.repository;

import com.idbi.wealthadvisor.entity.Account;
import com.idbi.wealthadvisor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    List<Account> findByUser(User user);
    List<Account> findByUserId(UUID userId);
}
