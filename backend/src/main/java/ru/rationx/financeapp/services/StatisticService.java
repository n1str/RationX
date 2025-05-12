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
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
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

    /**
     * Получить статистику за период по дням
     *
     * @param principal пользователь
     * @param startDate начальная дата
     * @param endDate конечная дата
     * @return список статистики по дням
     */
    public List<Map<String, Object>> getPeriodStats(Principal principal, Date startDate, Date endDate) {
        User user = userService.getUser(principal.getName());
        
        // Получаем транзакции за период
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(
                principal.getName(), startDate, endDate);
        
        // Группируем транзакции по дате
        Map<LocalDate, List<Transaction>> groupedByDate = transactions.stream()
                .filter(tx -> tx.getDateTime() != null)
                .collect(Collectors.groupingBy(tx -> tx.getDateTime()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate()));
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Преобразуем группированные данные в список статистики по дням
        for (Map.Entry<LocalDate, List<Transaction>> entry : groupedByDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<Transaction> dailyTransactions = entry.getValue();
            
            // Подсчитываем доходы и расходы
            double income = dailyTransactions.stream()
                    .filter(tx -> tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT)
                    .mapToDouble(tx -> tx.getRegTransaction().getSum())
                    .sum();
            
            double expenses = dailyTransactions.stream()
                    .filter(tx -> tx.getRegTransaction().getTransactionType() == TransactionType.CREDIT)
                    .mapToDouble(tx -> tx.getRegTransaction().getSum())
                    .sum();
            
            double balance = income - expenses;
            int count = dailyTransactions.size();
            
            Map<String, Object> dailyStats = new HashMap<>();
            dailyStats.put("period", Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant()));
            dailyStats.put("income", income);
            dailyStats.put("expenses", expenses);
            dailyStats.put("balance", balance);
            dailyStats.put("transactionCount", count);
            
            result.add(dailyStats);
        }
        
        // Сортируем по дате
        result.sort((a, b) -> ((Date) a.get("period")).compareTo((Date) b.get("period")));
        
        return result;
    }
}
