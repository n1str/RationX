package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.transaction.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // методы фильтрации по ИНН, статусу и т.д.
}

