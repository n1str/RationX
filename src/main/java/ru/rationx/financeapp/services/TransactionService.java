package ru.rationx.financeapp.services;

import aj.org.objectweb.asm.commons.Remapper;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;

import ru.rationx.financeapp.models.Transaction;
import ru.rationx.financeapp.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction update(UUID id, Transaction updatedData) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        List<Transaction.TransactionStatus> immutableStatuses = List.of(
                Transaction.TransactionStatus.ACCEPTED,
                Transaction.TransactionStatus.PROCESSING,
                Transaction.TransactionStatus.CANCELED,
                Transaction.TransactionStatus.PAYMENT_COMPLETED,
                Transaction.TransactionStatus.PAYMENT_DELETED,
                Transaction.TransactionStatus.RETURN
        );

        if (immutableStatuses.contains(transaction.getStatus())) {
            throw new IllegalStateException("Cannot edit transaction with status " + transaction.getStatus());
        }


        transaction.setComment(updatedData.getComment());
        transaction.setAmount(updatedData.getAmount());


        return repository.save(transaction);
    }

    public List<Transaction> getAll() {
        return repository.findAll();
        
    }

    public Remapper getById(UUID id) {
        return repository.findById()
        
    }

    public Transaction create(Transaction transaction) {
    }

    public void markAsDeleted(UUID id) {
    }
}
