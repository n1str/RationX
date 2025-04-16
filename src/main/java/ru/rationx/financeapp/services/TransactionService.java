package ru.rationx.financeapp.services;

import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.exception.DoesNotExistTransaction;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.repository.TransactionRepository;

import ru.rationx.financeapp.models.transaction.Transaction.TransactionStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    //-----------------------ФИЛЬТРЫ-----------------------------------//


    //Фильтрация по статусу

    public List<Transaction> getByStatus(Transaction.TransactionStatus status) {
        return repository.findByStatus(status);
    }

    //Фильтрация по ИНН получателя

    public List<Transaction> getByRecipientInn(String inn) {
        return repository.findBySubjectGetter_Inn(inn);
    }

    //Фильтрация по типу транзакции

    public List<Transaction> getByTransactionType(TransactionType type) {
        return repository.findByRegTransaction_TransactionType(type);
    }

    //Фильтрация по категории

    public List<Transaction> getBySenderBank(String nameBank) {
        return repository.findBySenderBank_NameBank(nameBank);
    }

    //Фильтрация по банку получателя

    public List<Transaction> getByRecipientBank(String nameBank) {
        return repository.findByRecipientBank_NameBank(nameBank);
    }

    //Фильтрация по диапазону дат

    public List<Transaction> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateTimeBetween(start, end);
    }

    //Фильтрация по диапазону суммы

//    public List<Transaction> getByAmountRange(Double min, Double max) {
//        return repository.findByAmountBetween(min, max);
//    }

    //Найти все транзакции

    public List<Transaction> getAll() {
        return repository.findAll();
    }

    //-----------------------ДЕЙСТВИЯ С ТРАЗАКЦИЯМИ-----------------------------------//


    //Создать новую транзакцию

    public Transaction create(Transaction transaction) {
        return repository.save(transaction);
    }

    //Изменение транзакции

    public Transaction update(Long id, Transaction updatedData) {
        Transaction transaction = repository.findById(id).orElseThrow();

        // Проверка статуса (редактирование запрещено для определённых статусов)
        if (transaction.getStatus() == Transaction.TransactionStatus.ACCEPTED ||
                transaction.getStatus() == Transaction.TransactionStatus.PROCESSING ||
                transaction.getStatus() == Transaction.TransactionStatus.CANCELED ||
                transaction.getStatus() == Transaction.TransactionStatus.PAYMENT_COMPLETED ||
                transaction.getStatus() == Transaction.TransactionStatus.PAYMENT_DELETED ||
                transaction.getStatus() == Transaction.TransactionStatus.RETURN) {
            throw new IllegalStateException("Редактирование запрещено для этого статуса");
        }

        transaction.setComment(updatedData.getComment());
        transaction.setDateTime(updatedData.getDateTime());
        transaction.setStatus(updatedData.getStatus());
        transaction.setSubjectSender(updatedData.getSubjectSender());
        transaction.setSubjectGetter(updatedData.getSubjectGetter());
        transaction.setRegTransaction(updatedData.getRegTransaction());

        return repository.save(transaction);
    }

    //Посмотреть по id транзакции

    private Transaction getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    //Удаление транзакции

    public void markAsDeleted(Long id) {
        repository.deleteById(id);
    }
}