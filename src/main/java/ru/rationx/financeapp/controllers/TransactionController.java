// Этот контроллер отвечает за работу с транзакциями через API (REST-запросы).
// Здесь описаны методы для создания, обновления и удаления транзакций.
// Всё, что связано с передачей данных между фронтендом и сервером — происходит тут.

package ru.rationx.financeapp.controllers;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.models.transaction.Transaction;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.services.TransactionService;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    //-----------------------ФИЛЬТРЫ-----------------------------------//

    //Получить все транзакции

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAll());
    }

    //Получить по статусу

    @GetMapping("/status")
    public ResponseEntity<List<Transaction>> getByStatus(@RequestParam Transaction.TransactionStatus status) {
        return ResponseEntity.ok(transactionService.getByStatus(status));
    }

    //Получить по ИНН получателя

    @GetMapping("/recipient-inn/{inn}")
    public ResponseEntity<List<Transaction>> getByRecipientInn(@PathVariable String inn) {
        List<Transaction> transactions = transactionService.getByRecipientInn(inn);
        return ResponseEntity.ok(transactions);
    }

    //Получить по типу транзакции

    @GetMapping("/type")
    public ResponseEntity<List<Transaction>> getByType(@RequestParam TransactionType type) {
        return ResponseEntity.ok(transactionService.getByTransactionType(type));
    }

    //Получить по банку отправителя

    @GetMapping("/sender-bank")
    public ResponseEntity<List<Transaction>> getBySenderBank(@RequestParam String nameBank) {
        return ResponseEntity.ok(transactionService.getBySenderBank(nameBank));
    }

    //Получить по диапазону дат

    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return ResponseEntity.ok(transactionService.getByDateRange(start, end));
    }


    //-----------------------ДЕЙСТВИЯ С ТРАЗАКЦИЯМИ-----------------------------------//

    //Создание транзакции

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        Transaction created = transactionService.create(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    //Изменение транзакции

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction updatedData) {
        return ResponseEntity.ok(transactionService.update(id, updatedData));
    }

    //Удаление транзакции

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.markAsDeleted(id);
        return ResponseEntity.noContent().build();
    }

}
