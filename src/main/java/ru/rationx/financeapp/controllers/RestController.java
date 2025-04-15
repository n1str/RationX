//package ru.rationx.financeapp.controllers;
//
//import jakarta.persistence.EntityNotFoundException;
//import lombok.Data;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import ru.rationx.financeapp.models.Transaction;
//import ru.rationx.financeapp.services.TransactionService;
//
//import java.util.List;
//import java.util.UUID;
//import org.springframework.web.bind.annotation.RestController;
//
//@Data
//@RestController
//@RequestMapping("/api/transactions")
//public class TransactionController {
//
//    @Autowired
//    public final TransactionService transactionService;
//
//
////    @GetMapping("/{id}")
////    public ResponseEntity<Transaction> getTransactionById(@PathVariable UUID id) {
////        return transactionService.getById(id)
////                .map(ResponseEntity::ok)
////                .orElse(ResponseEntity.notFound().build());
////    }
//
//    @PostMapping
//    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
//        Transaction created = transactionService.create(transaction);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
//
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
