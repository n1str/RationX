//// Этот сервис отвечает за всю логику работы с транзакциями.
//// Здесь описано, как создавать, обновлять, искать и удалять транзакции в базе данных.
//// @Service или @Autowired — способы подключить сервис к другим частям приложения.
//// Если нужно поменять бизнес-логику (например, добавить новые проверки или изменить способ поиска) — делать это тут.
////
//// Пример: чтобы создать новую транзакцию, вызывается метод create().
//// Чтобы получить все транзакции — getAll().
////
//
//package ru.rationx.financeapp.services;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import jakarta.persistence.EntityNotFoundException;
//import java.util.List;
//import java.util.UUID;
//
//import ru.rationx.financeapp.models.transaction.Transaction;
//import ru.rationx.financeapp.models.exception.DoesNotExistTransaction;
//import ru.rationx.financeapp.repository.TransactionRepository;
//
///**
// * Сервис для работы с транзакциями.
// */
//@Service
//public class TransactionService {
//
//    @Autowired
//    private final TransactionRepository repository;
//
//    public TransactionService(TransactionRepository repository) {
//        this.repository = repository;
//    }
//
//    /**
//     * Обновляет транзакцию по ID.
//     * Если статус не позволяет редактировать — выбрасывает ошибку.
//     */
//    public Transaction update(Long id, Transaction updatedData) {
//        Transaction transaction = repository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
//
//        List<Transaction.TransactionStatus> immutableStatuses = List.of(
//                Transaction.TransactionStatus.ACCEPTED,
//                Transaction.TransactionStatus.PROCESSING,
//                Transaction.TransactionStatus.CANCELED,
//                Transaction.TransactionStatus.PAYMENT_COMPLETED,
//                Transaction.TransactionStatus.PAYMENT_DELETED,
//                Transaction.TransactionStatus.RETURN
//        );
//
//        if (immutableStatuses.contains(transaction.getStatus())) {
//            throw new IllegalStateException("Cannot edit transaction with status " + transaction.getStatus());
//        }
//
//        transaction.setComment(updatedData.getComment());
//    //    transaction.setAmount(updatedData.getAmount());
//
//        return repository.save(transaction);
//    }
//
//    /**
//     * Возвращает все транзакции.
//     */
//    public List<Transaction> getAll() {
//        return repository.findAll();
//    }
//
//    /**
//     * Получает транзакцию по ID.
//     */
//    public Transaction getById(Long id) {
//        return repository.findById(id)
//                .orElseThrow(() -> new DoesNotExistTransaction("Транзакция не найдена"));
//    }
//
//    /**
//     * Создаёт новую транзакцию.
//     */
//    public Transaction create(Transaction transaction) {
//        return repository.save(transaction);
//    }
//
//    /**
//     * Помечает транзакцию как удалённую.
//     */
//    public void markAsDeleted(UUID id) {
//    }
//}
