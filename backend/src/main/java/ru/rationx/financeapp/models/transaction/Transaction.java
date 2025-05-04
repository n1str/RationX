package ru.rationx.financeapp.models.transaction;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import ru.rationx.financeapp.models.bank.Bank;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.user.User;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Эта сущность описывает одну финансовую операцию (транзакцию).
 * Здесь хранятся все детали — кто, кому, когда и что сделал, статус, комментарий и ссылки на связанные объекты.
 */

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Описывает одну финансовую операцию (транзакцию).
// Например: перевод денег, оплата, возврат и т.д.
// Здесь хранятся все детали — кто, кому, когда и что сделал.
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Уникальный номер транзакции (создаётся автоматически)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    // Здесь хранится текущий статус транзакции (например, новая, отменена и т.д.)
    private TransactionStatus status = TransactionStatus.NEW; // По умолчанию - новая

    // -----------------
    // Банк

    @ManyToOne(cascade = CascadeType.ALL)
    private Bank senderBank;

    @ManyToOne(cascade = CascadeType.ALL)
    private Bank recipientBank;

    //------------------

    @NotNull
    // Когда произошла операция (дата и время)
    private LocalDateTime dateTime = LocalDateTime.now();

    // Комментарий к транзакции (необязательный)
    private String comment;

    // Категория операции (например, "Продукты", "Коммунальные услуги")
    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "category_id")
    private Category category;

    // Связь с детальной информацией о транзакции (сумма, тип - дебет/кредит)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "reg_transaction_id")
    private RegTransaction regTransaction;

    // Кто отправил деньги (или начал операцию)
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subjectSender;

    // Кто получил деньги (или был получателем в операции)
    @ManyToOne
    @JoinColumn(name = "subject_getter_id", nullable = false )
    private Subject subjectGetter;

    // Инициатор операции
    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Проверяет, можно ли редактировать транзакцию.
     * В соответствии с требованиями: только транзакции со статусом NEW могут быть отредактированы
     *
     * Не допущены к редактированию операции со статусами: подтвержденная, в обработке, отменена, платеж выполнен, платеж удален, возврат.
     */
    public boolean isEditable() {
        return status == TransactionStatus.NEW;
    }

    /**
     * Проверяет, можно ли удалить транзакцию.
     * В соответствии с требованиями: транзакции со статусами ACCEPTED, PROCESSING, CANCELED, PAYMENT_COMPLETED и RETURN
     * не могут быть удалены
     */
    public boolean isDeletable() {
        return status != TransactionStatus.ACCEPTED &&
               status != TransactionStatus.PROCESSING &&
               status != TransactionStatus.CANCELED &&
               status != TransactionStatus.PAYMENT_COMPLETED &&
               status != TransactionStatus.RETURN;
    }

}
