package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.Subject;
import ru.rationx.financeapp.models.transaction.RegTransaction;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Репозиторий для работы с транзакциями.
 * Здесь можно искать, сохранять и удалять транзакции в базе данных.
 * Добавить фильтрацию по ИНН, статусу или другим полям — тут.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // По статусу
    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    // По ИНН получателя (если поле называется recipient, а в нем поле inn)

    List<Transaction> findBySubjectGetter_Inn(String inn);

    // По типу транзакции

    List<Transaction> findByRegTransaction_TransactionType(TransactionType transactionType);

    // По категории

    //List<Transaction> findByCategory(String category);

    // По банку отправителя (если есть связь senderBank -> Bank -> nameBank)

    List<Transaction> findBySenderBank_NameBank(String nameBank);

    // По банку получателя (если есть связь recipientBank -> Bank -> nameBank)
    List<Transaction> findByRecipientBank_NameBank(String nameBank);

    // По дате (диапазон)
    List<Transaction> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);

    // По сумме (диапазон)
    //List<Transaction> findByAmountBetween(Double min, Double max);





}
