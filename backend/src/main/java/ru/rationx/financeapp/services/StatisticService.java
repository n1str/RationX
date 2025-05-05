package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.dto.statistic.StatisticDTO;
import ru.rationx.financeapp.models.transaction.RegTransaction;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.models.user.User;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class StatisticService {
    private final TransactionService transactionService;
    private final UserService userService;

    public List<RegTransaction> getReg(User user) {
        return transactionService.getByUserId(user.getId())
                .stream()
                .map(Transaction::getRegTransaction).toList();
    }

    // Общая статистика на дашборды
    public Map<String, Object> generalStatistic(Principal principal){
        User user = userService.getUser(principal.getName());
        // Получаем регистр
        List<RegTransaction> regTransactions = getReg(user);

        Double totalIncome = regTransactions.stream()
                .filter(regTransaction -> regTransaction.getTransactionType().equals(TransactionType.DEBIT))
                .mapToDouble(RegTransaction::getSum)
                .reduce(Double::sum)
                .orElse(0);

        Double totalExpense = regTransactions.stream()
                .filter(regTransaction -> regTransaction.getTransactionType().equals(TransactionType.CREDIT))
                .mapToDouble(RegTransaction::getSum)
                .reduce(Double::sum)
                .orElse(0);

        // баланс по транзакциям
        Double balance = totalIncome - totalExpense;
        long count = regTransactions.size();

        return Map.of(
                "totalIncome", totalIncome,
                "totalExpense",totalExpense,
                "balance",balance,
                "transactionCount",count
        );

    }

    // Статистика по категориям
    public Map<String, StatisticDTO> getByCategory(Principal principal) {
        User user = userService.getUser(principal.getName());

        List<Transaction> byUserId = transactionService.getByUserId(user.getId());

        return byUserId.stream().collect(Collectors.toMap(transaction -> transaction.getCategory().getName(),
                        o -> StatisticDTO.builder()
                                .type(o.getCategory().getApplicableType().getDescription())
                                .sum(o.getRegTransaction().getSum())
                                .build(), (o, o2) -> {
                                    return StatisticDTO.builder().type(o.getType())
                                    .sum(o.getSum() + o2.getSum())
                                    .build();
                                }
                        )
        );
    }
}
