package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.TransactionType;

import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для работы с категориями транзакций.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Найти категорию по названию (без учета регистра)
     */
    Optional<Category> findByNameIgnoreCaseAndApplicableType(String name, TransactionType transactionType);

    Optional<Category> findByNameIgnoreCase(String name);
    
    /**
     * Найти все категории, применимые к указанному типу транзакций
     */
    List<Category> findByApplicableType(TransactionType applicableType);
}
