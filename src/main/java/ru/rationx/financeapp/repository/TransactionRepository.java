package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.transaction.Transaction;

/**
 * Репозиторий для работы с транзакциями.
 * Здесь можно искать, сохранять и удалять транзакции в базе данных.
 * Добавить фильтрацию по ИНН, статусу или другим полям — тут.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // методы фильтрации по ИНН, статусу и т.д.
}
