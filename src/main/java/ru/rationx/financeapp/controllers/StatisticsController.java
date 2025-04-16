package ru.rationx.financeapp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.services.TransactionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Контроллер для предоставления статистических данных и аналитики
 * для отображения на дашборде
 */
@RestController
@RequestMapping("/api/transactions")
public class StatisticsController {

    @Autowired
    private TransactionService transactionService;

    /**
     * Получение сводных данных о финансах
     * @return Сводные данные: доходы, расходы, баланс и кол-во транзакций
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<Transaction> transactions = transactionService.getAll();
        
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null) {
                if (tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT) {
                    totalIncome = totalIncome.add(BigDecimal.valueOf(tx.getRegTransaction().getSum()));
                } else {
                    totalExpense = totalExpense.add(BigDecimal.valueOf(tx.getRegTransaction().getSum()));
                }
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("balance", totalIncome.subtract(totalExpense));
        summary.put("transactionCount", transactions.size());
        
        // Можно добавить заглушку для целей по сбережениям
        summary.put("savingsGoal", 100000);
        summary.put("currentSavings", totalIncome.subtract(totalExpense));
        
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Получение статистики доходов и расходов
     * @return Данные о доходах и расходах по периодам
     */
    @GetMapping("/income-expense-stats")
    public ResponseEntity<Map<String, Object>> getIncomeExpenseStats() {
        // Получение всех транзакций
        List<Transaction> transactions = transactionService.getAll();
        
        // Настройка временных меток для последних 6 месяцев
        LocalDate now = LocalDate.now();
        List<String> labels = new ArrayList<>();
        
        // Создание меток для последних 6 месяцев
        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            labels.add(date.format(DateTimeFormatter.ofPattern("MM.yyyy")));
        }
        
        // Инициализация данных
        List<BigDecimal> incomeData = new ArrayList<>(Arrays.asList(
            BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
            BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
        ));
        
        List<BigDecimal> expenseData = new ArrayList<>(Arrays.asList(
            BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
            BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
        ));
        
        // Заполнение данных на основе транзакций
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getDateTime() != null) {
                LocalDate txDate = tx.getDateTime().toLocalDate();
                
                // Определяем, в какой месяц попадает транзакция
                for (int i = 0; i < 6; i++) {
                    LocalDate monthStart = now.minusMonths(5-i).withDayOfMonth(1);
                    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                    
                    if (txDate.isAfter(monthStart.minusDays(1)) && txDate.isBefore(monthEnd.plusDays(1))) {
                        BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                        
                        if (tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT) {
                            incomeData.set(i, incomeData.get(i).add(amount));
                        } else {
                            expenseData.set(i, expenseData.get(i).add(amount));
                        }
                    }
                }
            }
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("incomeData", incomeData);
        result.put("expenseData", expenseData);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Получение статистики по категориям
     * @return Данные о распределении транзакций по категориям
     */
    @GetMapping("/category-stats")
    public ResponseEntity<Map<String, Object>> getCategoryStats() {
        // Получение всех транзакций
        List<Transaction> transactions = transactionService.getAll();
        
        // Агрегирование данных по категориям
        Map<String, BigDecimal> categoryAmounts = new HashMap<>();
        
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getCategory() != null) {
                String categoryName = tx.getCategory().getName();
                BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                
                // Суммируем только расходы для этого графика
                if (tx.getRegTransaction().getTransactionType() == TransactionType.CREDIT) {
                    categoryAmounts.put(categoryName, 
                        categoryAmounts.getOrDefault(categoryName, BigDecimal.ZERO).add(amount));
                }
            }
        }
        
        // Сортировка категорий по сумме
        List<Map.Entry<String, BigDecimal>> sortedEntries = new ArrayList<>(categoryAmounts.entrySet());
        sortedEntries.sort(Map.Entry.<String, BigDecimal>comparingByValue().reversed());
        
        // Ограничиваем количество категорий до 10, остальные объединяем в "Другое"
        List<String> labels = new ArrayList<>();
        List<BigDecimal> values = new ArrayList<>();
        
        BigDecimal otherAmount = BigDecimal.ZERO;
        
        for (int i = 0; i < sortedEntries.size(); i++) {
            if (i < 9) {
                labels.add(sortedEntries.get(i).getKey());
                values.add(sortedEntries.get(i).getValue());
            } else {
                otherAmount = otherAmount.add(sortedEntries.get(i).getValue());
            }
        }
        
        // Добавляем "Другое", если есть что добавлять
        if (otherAmount.compareTo(BigDecimal.ZERO) > 0) {
            labels.add("Другое");
            values.add(otherAmount);
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("values", values);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Получение данных для тренда доходов/расходов
     * @return Данные о тенденциях доходов и расходов
     */
    @GetMapping("/trend-stats")
    public ResponseEntity<Map<String, Object>> getTrendStats() {
        // Получение всех транзакций
        List<Transaction> transactions = transactionService.getAll();
        
        // Настройка временных меток для последних 12 месяцев
        LocalDate now = LocalDate.now();
        List<String> labels = new ArrayList<>();
        
        // Создание меток для последних 12 месяцев
        for (int i = 11; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            labels.add(date.format(DateTimeFormatter.ofPattern("MM.yyyy")));
        }
        
        // Инициализация данных
        List<BigDecimal> incomeData = new ArrayList<>();
        List<BigDecimal> expenseData = new ArrayList<>();
        List<BigDecimal> balanceData = new ArrayList<>();
        
        for (int i = 0; i < 12; i++) {
            incomeData.add(BigDecimal.ZERO);
            expenseData.add(BigDecimal.ZERO);
            balanceData.add(BigDecimal.ZERO);
        }
        
        // Заполнение данных на основе транзакций
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getDateTime() != null) {
                LocalDate txDate = tx.getDateTime().toLocalDate();
                
                // Определяем, в какой месяц попадает транзакция
                for (int i = 0; i < 12; i++) {
                    LocalDate monthStart = now.minusMonths(11-i).withDayOfMonth(1);
                    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                    
                    if (txDate.isAfter(monthStart.minusDays(1)) && txDate.isBefore(monthEnd.plusDays(1))) {
                        BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                        
                        if (tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT) {
                            incomeData.set(i, incomeData.get(i).add(amount));
                        } else {
                            expenseData.set(i, expenseData.get(i).add(amount));
                        }
                    }
                }
            }
        }
        
        // Вычисление баланса для каждого месяца
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (int i = 0; i < 12; i++) {
            runningBalance = runningBalance.add(incomeData.get(i)).subtract(expenseData.get(i));
            balanceData.set(i, runningBalance);
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("incomeData", incomeData);
        result.put("expenseData", expenseData);
        result.put("balanceData", balanceData);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Получение статистики на основе выбранного периода
     * @param period Период (week, month, quarter, year, all)
     * @return Статистические данные для указанного периода
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatsByPeriod(@RequestParam String period) {
        // Определение начальной даты для периода
        LocalDateTime startDate;
        LocalDateTime endDate = LocalDateTime.now();
        
        switch (period) {
            case "week":
                startDate = endDate.minusWeeks(1);
                break;
            case "month":
                startDate = endDate.minusMonths(1);
                break;
            case "quarter":
                startDate = endDate.minusMonths(3);
                break;
            case "year":
                startDate = endDate.minusYears(1);
                break;
            case "all":
            default:
                startDate = LocalDateTime.now().minusYears(5); // Используем большой диапазон
                break;
        }
        
        // Получение транзакций за период
        List<Transaction> transactions = transactionService.getByDateRange(startDate, endDate);
        
        // Расчет данных для графиков
        Map<String, Object> incomeExpenseStats = calculateIncomeExpenseStats(transactions, period);
        Map<String, Object> categoryStats = calculateCategoryStats(transactions);
        Map<String, Object> trendStats = calculateTrendStats(transactions, period);
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("incomeExpense", incomeExpenseStats);
        result.put("category", categoryStats);
        result.put("trend", trendStats);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Получение последних транзакций для дашборда
     * @param limit Ограничение количества результатов
     * @return Список последних транзакций
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(@RequestParam(defaultValue = "5") int limit) {
        // Получение всех транзакций
        List<Transaction> allTransactions = transactionService.getAll();
        
        // Сортировка по дате (от новых к старым)
        allTransactions.sort((t1, t2) -> {
            if (t1.getDateTime() == null && t2.getDateTime() == null) return 0;
            if (t1.getDateTime() == null) return 1;
            if (t2.getDateTime() == null) return -1;
            return t2.getDateTime().compareTo(t1.getDateTime());
        });
        
        // Ограничение количества результатов
        List<Transaction> recentTransactions = allTransactions.stream()
            .limit(limit)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(recentTransactions);
    }
    
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    
    /**
     * Расчет данных доходов и расходов для графика
     */
    private Map<String, Object> calculateIncomeExpenseStats(List<Transaction> transactions, String period) {
        // Определение количества интервалов в зависимости от периода
        int intervals;
        
        switch (period) {
            case "week":
                intervals = 7; // дни недели
                break;
            case "month":
                intervals = 4; // недели
                break;
            case "quarter":
                intervals = 3; // месяцы
                break;
            case "year":
                intervals = 12; // месяцы
                break;
            case "all":
            default:
                intervals = 6; // полугодия
                break;
        }
        
        // Создание меток и данных
        List<String> labels = new ArrayList<>();
        List<BigDecimal> incomeData = new ArrayList<>();
        List<BigDecimal> expenseData = new ArrayList<>();
        
        // Заполнение данных нулями
        for (int i = 0; i < intervals; i++) {
            incomeData.add(BigDecimal.ZERO);
            expenseData.add(BigDecimal.ZERO);
        }
        
        // Заполнение меток и данных в зависимости от периода
        // (это упрощенная логика, в реальном приложении потребуется более сложная группировка)
        for (int i = 0; i < intervals; i++) {
            labels.add("Интервал " + (i + 1));
        }
        
        // Распределение транзакций по интервалам
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getDateTime() != null) {
                // Определение индекса интервала (упрощено)
                int intervalIndex = Math.min(intervals - 1, (int)(Math.random() * intervals));
                
                BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                
                if (tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT) {
                    incomeData.set(intervalIndex, incomeData.get(intervalIndex).add(amount));
                } else {
                    expenseData.set(intervalIndex, expenseData.get(intervalIndex).add(amount));
                }
            }
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("incomeData", incomeData);
        result.put("expenseData", expenseData);
        
        return result;
    }
    
    /**
     * Расчет данных по категориям
     */
    private Map<String, Object> calculateCategoryStats(List<Transaction> transactions) {
        // Агрегирование данных по категориям
        Map<String, BigDecimal> categoryAmounts = new HashMap<>();
        
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getCategory() != null) {
                String categoryName = tx.getCategory().getName();
                BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                
                // Суммируем только расходы для этого графика
                if (tx.getRegTransaction().getTransactionType() == TransactionType.CREDIT) {
                    categoryAmounts.put(categoryName, 
                        categoryAmounts.getOrDefault(categoryName, BigDecimal.ZERO).add(amount));
                }
            }
        }
        
        // Сортировка категорий по сумме
        List<Map.Entry<String, BigDecimal>> sortedEntries = new ArrayList<>(categoryAmounts.entrySet());
        sortedEntries.sort(Map.Entry.<String, BigDecimal>comparingByValue().reversed());
        
        // Ограничиваем количество категорий до 10, остальные объединяем в "Другое"
        List<String> labels = new ArrayList<>();
        List<BigDecimal> values = new ArrayList<>();
        
        BigDecimal otherAmount = BigDecimal.ZERO;
        
        for (int i = 0; i < sortedEntries.size(); i++) {
            if (i < 9) {
                labels.add(sortedEntries.get(i).getKey());
                values.add(sortedEntries.get(i).getValue());
            } else {
                otherAmount = otherAmount.add(sortedEntries.get(i).getValue());
            }
        }
        
        // Добавляем "Другое", если есть что добавлять
        if (otherAmount.compareTo(BigDecimal.ZERO) > 0) {
            labels.add("Другое");
            values.add(otherAmount);
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("values", values);
        
        return result;
    }
    
    /**
     * Расчет данных для трендов
     */
    private Map<String, Object> calculateTrendStats(List<Transaction> transactions, String period) {
        // Определение количества интервалов и их формата в зависимости от периода
        int intervals;
        switch (period) {
            case "week":
                intervals = 7; // дни недели
                break;
            case "month":
                intervals = 4; // недели
                break;
            case "quarter":
                intervals = 3; // месяцы
                break;
            case "year":
                intervals = 12; // месяцы
                break;
            case "all":
            default:
                intervals = 6; // последние полугодия
                break;
        }
        
        // Создание меток и данных
        List<String> labels = new ArrayList<>();
        List<BigDecimal> incomeData = new ArrayList<>();
        List<BigDecimal> expenseData = new ArrayList<>();
        List<BigDecimal> balanceData = new ArrayList<>();
        
        // Заполнение данных нулями
        for (int i = 0; i < intervals; i++) {
            labels.add("Интервал " + (i + 1));
            incomeData.add(BigDecimal.ZERO);
            expenseData.add(BigDecimal.ZERO);
            balanceData.add(BigDecimal.ZERO);
        }
        
        // Распределение транзакций по интервалам
        for (Transaction tx : transactions) {
            if (tx.getRegTransaction() != null && tx.getDateTime() != null) {
                // Определение индекса интервала (упрощено)
                int intervalIndex = Math.min(intervals - 1, (int)(Math.random() * intervals));
                
                BigDecimal amount = BigDecimal.valueOf(tx.getRegTransaction().getSum());
                
                if (tx.getRegTransaction().getTransactionType() == TransactionType.DEBIT) {
                    incomeData.set(intervalIndex, incomeData.get(intervalIndex).add(amount));
                } else {
                    expenseData.set(intervalIndex, expenseData.get(intervalIndex).add(amount));
                }
            }
        }
        
        // Вычисление баланса для каждого интервала
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (int i = 0; i < intervals; i++) {
            runningBalance = runningBalance.add(incomeData.get(i)).subtract(expenseData.get(i));
            balanceData.set(i, runningBalance);
        }
        
        // Формирование результата
        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("incomeData", incomeData);
        result.put("expenseData", expenseData);
        result.put("balanceData", balanceData);
        
        return result;
    }
}
