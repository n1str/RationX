package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.rationx.financeapp.models.bank.Bank;

import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank,Long> {
    Optional<Bank> findByBill(String bill);
}
