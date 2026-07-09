package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.CreateTransactionRequest;
import com.idbi.wealthadvisor.dto.TransactionDto;
import com.idbi.wealthadvisor.entity.Account;
import com.idbi.wealthadvisor.entity.Transaction;
import com.idbi.wealthadvisor.entity.TransactionType;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.exception.ResourceNotFoundException;
import com.idbi.wealthadvisor.repository.AccountRepository;
import com.idbi.wealthadvisor.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public Page<TransactionDto> getTransactions(User user, int page, int size) {
        return transactionRepository
                .findByUserId(user.getId(), PageRequest.of(page, size, Sort.by("transactionDate").descending()))
                .map(this::toDto);
    }

    @Transactional
    public TransactionDto create(User user, CreateTransactionRequest request) {
        Account account = accountRepository.findByUserId(user.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No account found for user"));

        Transaction tx = transactionRepository.save(Transaction.builder()
                .account(account)
                .amount(request.amount())
                .type(request.type())
                .categoryName(request.categoryName())
                .merchant(request.merchant())
                .description(request.description())
                .transactionDate(request.effectiveDate())
                .build());

        // Adjust balance
        if (request.type() == TransactionType.CREDIT) {
            account.setBalance(account.getBalance().add(request.amount()));
        } else {
            account.setBalance(account.getBalance().subtract(request.amount()));
        }
        accountRepository.save(account);

        return toDto(tx);
    }

    @Transactional
    public void delete(User user, UUID transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .filter(t -> t.getAccount().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Reverse the balance effect
        Account account = tx.getAccount();
        if (tx.getType() == TransactionType.CREDIT) {
            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(tx.getAmount()));
        }
        accountRepository.save(account);
        transactionRepository.delete(tx);
    }

    public List<String> getCategories() {
        return List.of(
                "Salary", "Freelance", "Food & Dining", "Transport", "Shopping",
                "Entertainment", "Bills & Utilities", "Healthcare", "Education",
                "Investment", "EMI", "Groceries", "Other"
        );
    }

    private TransactionDto toDto(Transaction t) {
        return new TransactionDto(
                t.getId(), t.getAmount(), t.getType().name(),
                t.getCategoryName(), t.getMerchant(), t.getDescription(),
                t.getTransactionDate()
        );
    }
}
