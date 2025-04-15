//// Этот контроллер отвечает за работу с транзакциями через API (REST-запросы).
//// Здесь описаны методы для создания, обновления и удаления транзакций.
//// Всё, что связано с передачей данных между фронтендом и сервером — происходит тут.
//// Многие методы сейчас закомментированы — если понадобится вернуть их, просто раскомментируй нужный участок.
//// Если не знаешь, что такое ResponseEntity или @RequestBody — не переживай, это просто способы удобно работать с данными в Spring.
////
//// Пример: чтобы создать новую транзакцию, отправь POST-запрос на /api/transactions с нужными данными.
////
//// Если появятся вопросы — смотри комментарии к каждому методу!
//
//package ru.rationx.financeapp.controllers;
//
//import jakarta.persistence.EntityNotFoundException;
//import lombok.Data;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import ru.rationx.financeapp.models.transaction.Transaction;
//import ru.rationx.financeapp.services.TransactionService;
//
//import java.util.List;
//import java.util.UUID;
//import org.springframework.web.bind.annotation.RestController;
//
///**
// * Контроллер для работы с транзакциями.
// *
// * @author [Ваше имя]
// */
//@Data
//@RestController
//@RequestMapping("/api/transactions")
//public class TransactionController {
//
//    /**
//     * Сервис для работы с транзакциями.
//     */
//    @Autowired
//    public final TransactionService transactionService;
//
//    /**
//     * Получить транзакцию по ID.
//     *
//     * @param id ID транзакции
//     * @return Транзакция или 404, если не найдена
//     */
////    @GetMapping("/{id}")
////    public ResponseEntity<Transaction> getTransactionById(@PathVariable UUID id) {
////        return transactionService.getById(id)
////                .map(ResponseEntity::ok)
////                .orElse(ResponseEntity.notFound().build());
////    }
//
//    /**
//     * Создать новую транзакцию.
//     *
//     * @param transaction Данные новой транзакции
//     * @return Созданная транзакция с статусом 201
//     */
//    @PostMapping
//    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
//        Transaction created = transactionService.create(transaction);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
//
//    /**
//     * Обновить существующую транзакцию.
//     *
//     * @param id         ID транзакции
//     * @param updatedData Данные для обновления
//     * @return Обновленная транзакция или 404, если не найдена
//     */
//    @PutMapping("/{id}")
//    public ResponseEntity<Transaction> updateTransaction(@PathVariable UUID id, @RequestBody Transaction updatedData) {
////        try {
////            Transaction updated = transactionService.update(id, updatedData);
////            return ResponseEntity.ok(updated);
////        } catch (IllegalStateException e) {
////            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
////        } catch (EntityNotFoundException e) {
////            return ResponseEntity.notFound().build();
////        }
//    }
//
//    /**
//     * Удалить транзакцию.
//     *
//     * @param id ID транзакции
//     * @return 204, если удалено успешно
//     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
//        try {
//            transactionService.markAsDeleted(id);
//            return ResponseEntity.noContent().build();
//        } catch (IllegalStateException e) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//        }
//    }
//}
