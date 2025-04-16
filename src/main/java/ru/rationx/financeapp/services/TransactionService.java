package ru.rationx.financeapp.services;

import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.Transaction.TransactionStatus;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.repository.TransactionRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

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
    public List<Transaction> getByStatus(TransactionStatus status) {
        return repository.findByStatus(status);
    }

    //Фильтрация по ИНН получателя
    public List<Transaction> getByRecipientInn(String inn) {
        return repository.findByRecipientInn(inn);
    }

    //Фильтрация по типу транзакции
    public List<Transaction> getByTransactionType(TransactionType type) {
        return repository.findByTransactionType(type);
    }

    //Фильтрация по категории
    public List<Transaction> getByCategory(Category category) {
        return repository.findByCategory(category);
    }

    //Фильтрация по банку отправителя
    public List<Transaction> getBySenderBank(String nameBank) {
        return repository.findBySenderBankName(nameBank);
    }

    //Фильтрация по банку получателя
    public List<Transaction> getByRecipientBank(String nameBank) {
        return repository.findByRecipientBankName(nameBank);
    }

    //Фильтрация по диапазону дат
    public List<Transaction> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateTimeBetween(start, end);
    }

    //Фильтрация по диапазону суммы
    public List<Transaction> getByAmountRange(Double min, Double max) {
        return repository.findByAmountBetween(min, max);
    }

    //Найти все транзакции
    public List<Transaction> getAll() {
        return repository.findAll();
    }

    //-----------------------ДЕЙСТВИЯ С ТРАЗАКЦИЯМИ-----------------------------------//

    //Создать новую транзакцию
    @Transactional
    public Transaction create(Transaction transaction) {
        // По умолчанию устанавливаем статус NEW, если не указан
        if (transaction.getStatus() == null) {
            transaction.setStatus(TransactionStatus.NEW);
        }
        return repository.save(transaction);
    }

    //Изменение транзакции
    @Transactional
    public Transaction update(Long id, Transaction updatedData) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));

        // Проверка возможности редактирования (используем новый метод isEditable)
        if (!transaction.isEditable()) {
            throw new IllegalStateException("Редактирование запрещено для транзакций со статусом " + transaction.getStatus());
        }

        // Обновляем только те поля, которые можно редактировать по ТЗ
        if (updatedData.getSubjectSender() != null) {
            transaction.setSubjectSender(updatedData.getSubjectSender());
        }
        
        if (updatedData.getDateTime() != null) {
            transaction.setDateTime(updatedData.getDateTime());
        }
        
        if (updatedData.getComment() != null) {
            transaction.setComment(updatedData.getComment());
        }
        
        if (updatedData.getRegTransaction() != null) {
            transaction.getRegTransaction().setSum(updatedData.getRegTransaction().getSum());
        }
        
        if (updatedData.getStatus() != null) {
            transaction.setStatus(updatedData.getStatus());
        }
        
        if (updatedData.getSenderBank() != null) {
            transaction.setSenderBank(updatedData.getSenderBank());
        }
        
        if (updatedData.getRecipientBank() != null) {
            transaction.setRecipientBank(updatedData.getRecipientBank());
        }
        
        if (updatedData.getSubjectGetter() != null) {
            transaction.setSubjectGetter(updatedData.getSubjectGetter());
        }
        
        if (updatedData.getCategory() != null) {
            transaction.setCategory(updatedData.getCategory());
        }

        return repository.save(transaction);
    }

    //Посмотреть по id транзакции
    public Transaction getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));
    }

    //Удаление транзакции
    @Transactional
    public void markAsDeleted(Long id) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));
        
        // Проверка возможности удаления
        if (!transaction.isDeletable()) {
            throw new IllegalStateException("Удаление запрещено для транзакций со статусом " + transaction.getStatus());
        }
        
        // Устанавливаем статус PAYMENT_DELETED вместо физического удаления
        transaction.setStatus(TransactionStatus.PAYMENT_DELETED);
        repository.save(transaction);
    }
}