package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.AccountDto;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public List<AccountDto> getAccounts(User user) {
        return accountRepository.findByUser(user).stream()
                .map(a -> new AccountDto(
                        a.getId(),
                        a.getAccountNumber(),
                        a.getAccountType().name(),
                        a.getBalance(),
                        a.getCurrency()
                ))
                .toList();
    }
}
