package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.transaction.RegTransaction;

@Repository
public interface RegTransactionsRepository extends JpaRepository<RegTransaction, Long> {
}
