// Этот контроллер отвечает за работу с транзакциями через API (REST-запросы).
// Здесь описаны методы для создания, обновления и удаления транзакций.
// Всё, что связано с передачей данных между фронтендом и сервером — происходит тут.

package ru.rationx.financeapp.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.controllers.mapper.TransactionMapper;
import ru.rationx.financeapp.models.dto.transaction.LiteTransactionDTO;
import ru.rationx.financeapp.models.dto.transaction.TransactionDTO;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionStatus;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.models.user.User;
import ru.rationx.financeapp.services.TransactionService;
import ru.rationx.financeapp.services.UserService;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final TransactionMapper transactionMapper;

    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions - User: {}", auth.getName());
            
            List<Transaction> transactions = transactionService.getAllTransactions();
            log.info("Retrieved {} transactions", transactions.size());
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving all transactions: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getTransactionsByStatus(
            @RequestParam(name = "status", required = false) TransactionStatus status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/status - User: {}, Status: {}", auth.getName(), status);
            
            List<Transaction> transactions;
            if (status != null) {
                transactions = transactionService.getTransactionsByStatus(status);
                log.info("Retrieved {} transactions with status {}", transactions.size(), status);
            } else {
                transactions = transactionService.getAllTransactions();
                log.info("Retrieved all {} transactions (no status filter)", transactions.size());
            }
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by status {}: {}", status, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по статусу: " + e.getMessage()));
        }
    }

    @GetMapping("/recipient-inn/{inn}")
    public ResponseEntity<?> getTransactionsByRecipientInn(@PathVariable String inn) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/recipient-inn/{} - User: {}", inn, auth.getName());
            
            List<Transaction> transactions = transactionService.getTransactionsByRecipientInn(inn);
            log.info("Retrieved {} transactions with recipient INN {}", transactions.size(), inn);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by recipient INN {}: {}", inn, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по ИНН получателя: " + e.getMessage()));
        }
    }

    @GetMapping("/type")
    public ResponseEntity<?> getTransactionsByType(
            @RequestParam(name = "type", required = false) TransactionType type) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/type - User: {}, Type: {}", auth.getName(), type);
            
            List<Transaction> transactions;
            if (type != null) {
                transactions = transactionService.getTransactionsByType(type);
                log.info("Retrieved {} transactions with type {}", transactions.size(), type);
            } else {
                transactions = transactionService.getAllTransactions();
                log.info("Retrieved all {} transactions (no type filter)", transactions.size());
            }
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by type {}: {}", type, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по типу: " + e.getMessage()));
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getTransactionsByCategory(@PathVariable Long categoryId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/category/{} - User: {}", categoryId, auth.getName());
            
            List<Transaction> transactions = transactionService.getTransactionsByCategory(categoryId);
            log.info("Retrieved {} transactions with category ID {}", transactions.size(), categoryId);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by category ID {}: {}", categoryId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по категории: " + e.getMessage()));
        }
    }

    @GetMapping("/sender-bank/{bank}")
    public ResponseEntity<?> getTransactionsBySenderBank(@PathVariable String bank) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/sender-bank/{} - User: {}", bank, auth.getName());
            
            List<Transaction> transactions = transactionService.getTransactionsBySenderBank(bank);
            log.info("Retrieved {} transactions with sender bank {}", transactions.size(), bank);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by sender bank {}: {}", bank, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по банку отправителя: " + e.getMessage()));
        }
    }

    @GetMapping("/recipient-bank/{bank}")
    public ResponseEntity<?> getTransactionsByRecipientBank(@PathVariable String bank) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/recipient-bank/{} - User: {}", bank, auth.getName());
            
            List<Transaction> transactions = transactionService.getTransactionsByRecipientBank(bank);
            log.info("Retrieved {} transactions with recipient bank {}", transactions.size(), bank);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by recipient bank {}: {}", bank, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по банку получателя: " + e.getMessage()));
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<?> getTransactionsByDateRange(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/date-range - User: {}, StartDate: {}, EndDate: {}",
                    auth.getName(), startDate, endDate);
            
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
            log.info("Retrieved {} transactions in date range from {} to {}", 
                    transactions.size(), startDate, endDate);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by date range from {} to {}: {}", 
                    startDate, endDate, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по диапазону дат: " + e.getMessage()));
        }
    }

    @GetMapping("/amount-range")
    public ResponseEntity<?> getTransactionsByAmountRange(
            @RequestParam("minAmount") BigDecimal minAmount,
            @RequestParam("maxAmount") BigDecimal maxAmount) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/amount-range - User: {}, MinAmount: {}, MaxAmount: {}",
                    auth.getName(), minAmount, maxAmount);
            
            List<Transaction> transactions = transactionService.getTransactionsByAmountRange(minAmount, maxAmount);
            log.info("Retrieved {} transactions in amount range from {} to {}", 
                    transactions.size(), minAmount, maxAmount);
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error retrieving transactions by amount range from {} to {}: {}", 
                    minAmount, maxAmount, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакций по диапазону сумм: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/transactions/{} - User: {}", id, auth.getName());
            
            Transaction transaction = transactionService.getTransactionById(id);
            if (transaction != null) {
                log.info("Retrieved transaction with ID {}", id);
                return ResponseEntity.ok(transaction);
            } else {
                log.info("Transaction with ID {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Транзакция не найдена"));
            }
        } catch (Exception e) {
            log.error("Error retrieving transaction with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении транзакции: " + e.getMessage()));
        }
    }

    @GetMapping("/get-all-tr")
    public ResponseEntity<?> getAllTransactionByAuthUser(Principal principal){
        // Получаем пользователя по имени
        User user = userService.getUser(principal.getName());
        // Транзакции пользователя
       List<LiteTransactionDTO> liteTransactionDTOS =
               transactionService.getByUserId(user.getId())
                       .stream()
                       .map(transactionMapper::toDTO)
                       .toList();

        return ResponseEntity.status(HttpStatus.OK).body(liteTransactionDTOS);
    }

    // Создание транзакции
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionDTO transaction, Principal principal) {
        try {
            log.info("POST /api/transactions - User: {}", principal.getName());
            
            Transaction savedTransaction = transactionService.create(transaction, principal);
            log.info("Created transaction with ID {}", savedTransaction.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
        } catch (Exception e) {
            log.error("Error creating transaction: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ошибка при создании транзакции: " + e.getMessage()));
        }
    }

    // Обновление транзакции
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionDTO updatedTransaction,
            Principal principal )  {

            log.info("PUT /api/transactions/{} - User: {}", id, principal.getName());
            
            Transaction transaction = transactionService.update(id, updatedTransaction);
            log.info("Updated transaction with ID {}", id);
            
            return ResponseEntity.ok(transaction);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("DELETE /api/transactions/{} - User: {}", id, auth.getName());
            
            transactionService.markAsDeleted(id);
            log.info("Marked transaction with ID {} as deleted", id);
            
            return ResponseEntity.ok(Map.of("message", "Транзакция успешно удалена"));
        } catch (Exception e) {
            log.error("Error deleting transaction with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при удалении транзакции: " + e.getMessage()));
        }
    }
}
