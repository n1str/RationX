// Этот контроллер отвечает за работу с транзакциями через API (REST-запросы).
// Здесь описаны методы для создания, обновления и удаления транзакций.
// Всё, что связано с передачей данных между фронтендом и сервером — происходит тут.

package ru.rationx.financeapp.controllers;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionStatus;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.services.CategoryService;
import ru.rationx.financeapp.services.TransactionService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final CategoryService categoryService;

    public TransactionController(TransactionService transactionService, CategoryService categoryService) {
        this.transactionService = transactionService;
        this.categoryService = categoryService;
    }

    //-----------------------ФИЛЬТРЫ-----------------------------------//

    // Получить все транзакции
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAll());
    }

    // Получить по статусу
    @GetMapping("/status")
    public ResponseEntity<List<Transaction>> getByStatus(@RequestParam TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getByStatus(status));
    }

    // Получить по ИНН получателя
    @GetMapping("/recipient-inn/{inn}")
    public ResponseEntity<List<Transaction>> getByRecipientInn(@PathVariable String inn) {
        List<Transaction> transactions = transactionService.getByRecipientInn(inn);
        return ResponseEntity.ok(transactions);
    }

    // Получить по типу транзакции
    @GetMapping("/type")
    public ResponseEntity<List<Transaction>> getByType(@RequestParam TransactionType type) {
        return ResponseEntity.ok(transactionService.getByTransactionType(type));
    }

    // Получить по категории
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Transaction>> getByCategory(@PathVariable Long categoryId) {
        Category category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(transactionService.getByCategory(category));
    }

    // Получить по банку отправителя
    @GetMapping("/sender-bank")
    public ResponseEntity<List<Transaction>> getBySenderBank(@RequestParam String bankName) {
        return ResponseEntity.ok(transactionService.getBySenderBank(bankName));
    }

    // Получить по банку получателя
    @GetMapping("/recipient-bank")
    public ResponseEntity<List<Transaction>> getByRecipientBank(@RequestParam String bankName) {
        return ResponseEntity.ok(transactionService.getByRecipientBank(bankName));
    }

    // Получить по диапазону дат
    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(transactionService.getByDateRange(start, end));
    }

    // Получить по диапазону сумм
    @GetMapping("/amount-range")
    public ResponseEntity<List<Transaction>> getByAmountRange(
            @RequestParam Double min,
            @RequestParam Double max) {
        return ResponseEntity.ok(transactionService.getByAmountRange(min, max));
    }

    //-----------------------ДЕЙСТВИЯ С ТРАЗАКЦИЯМИ-----------------------------------//

    // Создание транзакции
    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody Transaction transaction) {
        try {
            Transaction created = transactionService.create(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при создании транзакции: " + e.getMessage());
        }
    }

    // Изменение транзакции
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @Valid @RequestBody Transaction updatedData) {
        try {
            Transaction updated = transactionService.update(id, updatedData);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при обновлении транзакции: " + e.getMessage());
        }
    }

    // Получение транзакции по ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            Transaction transaction = transactionService.getById(id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Удаление транзакции
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            transactionService.markAsDeleted(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при удалении транзакции: " + e.getMessage());
        }
    }
}
