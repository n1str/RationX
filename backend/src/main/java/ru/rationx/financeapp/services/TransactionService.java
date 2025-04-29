package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.bank.Bank;
import ru.rationx.financeapp.models.dto.TransactionDTO;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.transaction.*;
import ru.rationx.financeapp.repository.TransactionRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import ru.rationx.financeapp.services.mapper.TransactionMapper;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SubjectService subjectService;
    private final BankService bankService;
    private final CategoryService categoryService;
    private final UserService userService;

    private final TransactionMapper transactionMapper;

    //-----------------------ФИЛЬТРЫ-----------------------------------//

    //Фильтрация по статусу
    public List<Transaction> getByStatus(TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    //Фильтрация по ИНН получателя
    public List<Transaction> getByRecipientInn(String inn) {
        return transactionRepository.findByRecipientInn(inn);
    }

    //Фильтрация по типу транзакции
    public List<Transaction> getByTransactionType(TransactionType type) {
        return transactionRepository.findByType(type);
    }

    //Фильтрация по категории
    public List<Transaction> getByCategory(Category category) {
        return transactionRepository.findByCategoryId(category.getId());
    }

    //Фильтрация по банку отправителя
    public List<Transaction> getBySenderBank(String nameBank) {
        return transactionRepository.findBySenderBank(nameBank);
    }

    //Фильтрация по банку получателя
    public List<Transaction> getByRecipientBank(String nameBank) {
        return transactionRepository.findByRecipientBank(nameBank);
    }

    //Фильтрация по диапазону дат
    public List<Transaction> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByDateBetween(start, end);
    }

    //Фильтрация по диапазону суммы
    public List<Transaction> getByAmountRange(Double min, Double max) {
        return transactionRepository.findByAmountBetween(BigDecimal.valueOf(min), BigDecimal.valueOf(max));
    }

    //Найти все транзакции
    public List<Transaction> getAll() {
        return transactionRepository.findAll();
    }

    //-----------------------ДЕЙСТВИЯ С ТРАЗАКЦИЯМИ-----------------------------------//

    //Создать новую транзакцию
    @Transactional
    public Transaction create(TransactionDTO transaction, Principal principal) {

        // Получаем субъекта (отправителя)

        log.info("Запускаем метод перезаписать/создать субъекта (главный). [getOrCreateSubject] ");
        Subject subject = subjectService.getOrCreateSubject(
                transaction.getInn(),
                transaction.getName(),
                transaction.getPersonType(),
                transaction.getAddress(),
                transaction.getPhone()
        );

        log.info("Запускаем метод перезаписать/создать субъекта (recipient). [getOrCreateSubject] ");
        Subject subjectRecipient = subjectService.getOrCreateSubject(
                transaction.getInnRecipient(),
                transaction.getNameRecipient(),
                transaction.getPersonTypeRecipient(),
                transaction.getAddressRecipient(),
                transaction.getRecipientPhoneRecipient()
        );


        log.info("Создаем банк для субъекта ");
        Bank bank = bankService.create(
                transaction.getNameBank(),
                transaction.getRBill(),
                transaction.getBill(),
                subject
        );


        Bank bankRecipient = bankService.create(
                transaction.getNameBankRecip(),
                transaction.getRBillRecip(),
                transaction.getBillRecip(),
                subjectRecipient
        );


        Category category = categoryService.findOrCreateCategory(transaction.getCategory(),
                transaction.getTransactionType());



        Transaction buildTransaction = Transaction.builder()
                .status(TransactionStatus.NEW)
                .dateTime(LocalDateTime.now())
                .subjectSender(subject)
                .subjectGetter(subjectRecipient)
                .senderBank(bank)
                .recipientBank(bankRecipient)
                .comment(transaction.getComment())
                .regTransaction(RegTransaction.builder()
                        .transactionType(transaction.getTypeOperation())
                        .sum(transaction.getSum())
                        .build())
                .category(category)
                .user(userService.getUser(principal.getName()))
                .build();

        transactionRepository.save(buildTransaction);
        log.info("Транзакция успешно собрана без ошибок. ");
        return buildTransaction;

    }

    //Изменение транзакции
    @Transactional
    public Transaction update(Long id, TransactionDTO updatedData) {
        // Получаем транзакцию по id
        Transaction transaction = getById(id);

        transactionMapper.updateTransaction(updatedData,transaction);

        return transactionRepository.save(transaction);
    }

    //Посмотреть по id транзакции
    public Transaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));
    }

    //Удаление транзакции
    @Transactional
    public void markAsDeleted(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));
        
        // Проверка возможности удаления
        if (!transaction.isDeletable()) {
            throw new IllegalStateException("Удаление запрещено для транзакций со статусом " + transaction.getStatus());
        }
        
        // Устанавливаем статус PAYMENT_DELETED вместо физического удаления
        transaction.setStatus(TransactionStatus.PAYMENT_DELETED);
        transactionRepository.save(transaction);
    }

    /**
     * Получить все транзакции
     */
    public List<Transaction> getAllTransactions() {
        try {
            return transactionRepository.findAll();
        } catch (Exception e) {
            log.error("Error while getting all transactions", e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакцию по ID
     */
    public Transaction getTransactionById(Long id) {
        try {
            Optional<Transaction> transaction = transactionRepository.findById(id);
            return transaction.orElse(null);
        } catch (Exception e) {
            log.error("Error while getting transaction by id: " + id, e);
            return null;
        }
    }

    /**
     * Получить транзакции по статусу
     */
    public List<Transaction> getTransactionsByStatus(TransactionStatus status) {
        try {
            return transactionRepository.findByStatus(status);
        } catch (Exception e) {
            log.error("Error while getting transactions by status: " + status, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по типу
     */
    public List<Transaction> getTransactionsByType(TransactionType type) {
        try {
            return transactionRepository.findByType(type);
        } catch (Exception e) {
            log.error("Error while getting transactions by type: " + type, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по категории
     */
    public List<Transaction> getTransactionsByCategory(Long categoryId) {
        try {
            return transactionRepository.findByCategoryId(categoryId);
        } catch (Exception e) {
            log.error("Error while getting transactions by category id: " + categoryId, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по ИНН получателя
     */
    public List<Transaction> getTransactionsByRecipientInn(String inn) {
        try {
            return transactionRepository.findByRecipientInn(inn);
        } catch (Exception e) {
            log.error("Error while getting transactions by recipient inn: " + inn, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по банку отправителя
     */
    public List<Transaction> getTransactionsBySenderBank(String bank) {
        try {
            return transactionRepository.findBySenderBank(bank);
        } catch (Exception e) {
            log.error("Error while getting transactions by sender bank: " + bank, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по банку получателя
     */
    public List<Transaction> getTransactionsByRecipientBank(String bank) {
        try {
            return transactionRepository.findByRecipientBank(bank);
        } catch (Exception e) {
            log.error("Error while getting transactions by recipient bank: " + bank, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по диапазону дат
     */
    public List<Transaction> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            return transactionRepository.findByDateBetween(startDateTime, endDateTime);
        } catch (Exception e) {
            log.error("Error while getting transactions by date range: " + startDate + " - " + endDate, e);
            return Collections.emptyList();
        }
    }

    /**
     * Получить транзакции по диапазону сумм
     */
    public List<Transaction> getTransactionsByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        try {
            return transactionRepository.findByAmountBetween(minAmount, maxAmount);
        } catch (Exception e) {
            log.error("Error while getting transactions by amount range: " + minAmount + " - " + maxAmount, e);
            return Collections.emptyList();
        }
    }
}