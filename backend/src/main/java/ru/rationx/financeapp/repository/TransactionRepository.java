package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.rationx.financeapp.models.transaction.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Репозиторий для работы с транзакциями.
 * Здесь можно искать, сохранять и удалять транзакции в базе данных.
 * Добавить фильтрацию по ИНН, статусу или другим полям — тут.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // По id пользователя
   List<Transaction> findAllByUserId(Long id);

    // По username пользователя
    //List<Transaction> findAllByUserUsername(String username);

    // По статусу
    List<Transaction> findByStatus(TransactionStatus status);

    // По ИНН получателя
    @Query("SELECT t FROM Transaction t WHERE t.subjectGetter.inn = :inn")
    List<Transaction> findByRecipientInn(@Param("inn") String inn);

    // По типу транзакции
    @Query("SELECT t FROM Transaction t WHERE t.regTransaction.transactionType = :type")
    List<Transaction> findByType(@Param("type") TransactionType type);

    // По категории
    @Query("SELECT t FROM Transaction t WHERE t.category.id = :categoryId")
    List<Transaction> findByCategoryId(@Param("categoryId") Long categoryId);

    // По банку отправителя
    @Query("SELECT t FROM Transaction t WHERE t.senderBank.nameBank = :bankName")
    List<Transaction> findBySenderBank(@Param("bankName") String bankName);

    // По банку получателя
    @Query("SELECT t FROM Transaction t WHERE t.recipientBank.nameBank = :bankName")
    List<Transaction> findByRecipientBank(@Param("bankName") String bankName);

    // По дате (диапазон)
    @Query("SELECT t FROM Transaction t WHERE t.dateTime BETWEEN :start AND :end")
    List<Transaction> findByDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // По сумме (диапазон)
    @Query("SELECT t FROM Transaction t WHERE t.regTransaction.sum BETWEEN :min AND :max")
    List<Transaction> findByAmountBetween(@Param("min") BigDecimal min, @Param("max") BigDecimal max);
}
