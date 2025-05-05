package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.bank.Bank;
import ru.rationx.financeapp.models.dto.transaction.TransactionDTO;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.transaction.*;
import ru.rationx.financeapp.repository.TransactionRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import ru.rationx.financeapp.services.exception.NoPermStatusException;
import ru.rationx.financeapp.services.mapper.TransactionMapper;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SubjectService subjectService;
    private final BankService bankService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final RegService regService;

    private final TransactionMapper transactionMapper;

    //-----------------------ФИЛЬТРЫ-----------------------------------//

    //Найти все транзакции
    public List<Transaction> getAll() {
        return transactionRepository.findAll();
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
        if (!transaction.isEditable()) {
            log.error("Возникла ошибка при редактировании, отсутствие прав что бы отредактировать транзакцию. ");
            throw new NoPermStatusException("У вас нет разрешения что бы редактировать транзакцию с такими статусами: " +
                    "{подтвержденная, в обработке, отменена, платеж выполнен, платеж удален, возврат}");
        }

        transactionMapper.updateTransaction(updatedData,transaction);

        // Категория
        Map<String, Object> categoryMap = new HashMap<>();
            categoryMap.put("category",updatedData.getCategory());
            categoryMap.put("type",updatedData.getTypeOperation());

        Category category = categoryService.findOrCreateCategory(updatedData.getCategory(),
                updatedData.getTransactionType());

            categoryService.updateCategoryMap(categoryMap, category);

        // Субъект (главный)
        Map<String,Object> subject0 = new HashMap<>();
            subject0.put("name",updatedData.getName());
            subject0.put("personType",updatedData.getPersonType());
            subject0.put("inn",updatedData.getInn());
            subject0.put("address",updatedData.getAddress());
            subject0.put("phone", updatedData.getPhone());

        Subject sub0 = subjectService.getOrCreateSubject(
                updatedData.getInn(),
                updatedData.getName(),
                updatedData.getPersonType(),
                updatedData.getAddress(),
                updatedData.getPhone()
        );

        subjectService.updateSubject(subject0,sub0);

        // Субъект (дочка)
        Map<String,Object> subject1 = new HashMap<>();
            subject1.put("name",updatedData.getNameRecipient());
            subject1.put("personType",updatedData.getPersonTypeRecipient());
            subject1.put("inn",updatedData.getInnRecipient());
            subject1.put("address",updatedData.getAddressRecipient());
            subject1.put("phone", updatedData.getRecipientPhoneRecipient());

        Subject sub1 = subjectService.getOrCreateSubject(
                updatedData.getInnRecipient(),
                updatedData.getNameRecipient(),
                updatedData.getPersonTypeRecipient(),
                updatedData.getAddressRecipient(),
                updatedData.getRecipientPhoneRecipient()
        );

        subjectService.updateSubject(subject1,sub1);


        // Обновление данных об банках главного субъекта
        Map<String,Object> bank1 = new HashMap<>();
            bank1.put("nameBank",updatedData.getNameBank());
            bank1.put("bill",updatedData.getBill());
            bank1.put("rBill",updatedData.getRBill());
            bank1.put("subj",sub0);
        bankService.updateOrCreateBank(bank1);


        // Обновление данных об банках дочернего субъекта
        Map<String,Object> bank2 = new HashMap<>();
            bank2.put("nameBank",updatedData.getNameBankRecip());
            bank2.put("bill",updatedData.getBillRecip());
            bank2.put("rBill",updatedData.getRBillRecip());
            bank2.put("subj",sub1);
        bankService.updateOrCreateBank(bank2);



        // Обновление данных о регистрах накопления которые приход/расход
        regService.updateReg(transaction,updatedData.getSum(), updatedData.getTransactionType());

        // Ставим статус (опасность налл)
        if (updatedData.getStatus() != null || !updatedData.getStatus().getDescription().isBlank()) {
            log.info("Подтягиваем статус транзакции `{}`...",updatedData.getStatus());
            transaction.setStatus(updatedData.getStatus());
        }

        // Обновляем ссылки
        transaction.setSubjectSender(sub0);
        transaction.setSubjectGetter(sub1);
        transaction.setCategory(category);


        return transactionRepository.save(transaction);
    }

    //Посмотреть по id транзакции
    public Transaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Транзакция с ID " + id + " не найдена"));
    }

    // найти транзакции по id user
    public List<Transaction> getByUserId(Long id){
        return transactionRepository.findAllByUserId(id);
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

}