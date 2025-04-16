package ru.rationx.financeapp.models.transaction;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import ru.rationx.financeapp.models.Bank;
import ru.rationx.financeapp.models.Subject;

import java.time.LocalDateTime;

/**
 * Эта сущность описывает одну финансовую операцию (транзакцию).
 * Здесь хранятся все детали — кто, кому, когда и что сделал, статус, комментарий и ссылки на связанные объекты.
 * Если нужно добавить новое поле или логику для транзакции — тут.
 */
@Data
@Entity
// Описывает одну финансовую операцию (транзакцию).
// Например: перевод денег, оплата, возврат и т.д.
// Здесь хранятся все детали — кто, кому, когда и что сделал.
public class Transaction {

    @Id
    @GeneratedValue
    // Уникальный номер транзакции (создаётся автоматически)
    private Long id;

    /**
     * Перечисление (enum) — список возможных статусов для любой транзакции.
     */
    public enum TransactionStatus {
        NEW("Новая"),
        ACCEPTED("Подтвержденная"),
        PROCESSING("В обработке"),
        CANCELED("Отмена"),
        PAYMENT_COMPLETED("Платеж выполнен"),
        PAYMENT_DELETED("Платеж удален"),
        RETURN("Возврат");

        public String ch;
        TransactionStatus(String ch) {
            this.ch = ch;
        }
    }

    @NotNull
    @Enumerated(EnumType.ORDINAL)
    // Здесь хранится текущий статус транзакции (например, новая, отменена и т.д.)
    private TransactionStatus status;

    // -----------------
    // Банк

    @ManyToOne(cascade = CascadeType.ALL)
    private Bank senderBank;

    @ManyToOne(cascade = CascadeType.ALL)
    private Bank recipientBank;

    //------------------

    @NotNull
    // Когда произошла операция (дата и время)
    private LocalDateTime dateTime;

    private String comment; // комментарий к транзакции

    //  one to one

    // Ссылка на отдельный объект, где хранится инфа о том, дебет это или кредит

    //БЫЛО ТАК
//    @OneToOne
//    @JoinColumn(name = "reg_transaction_id")
//    private RegTransaction regTransaction;

    //СТАЛО ТАК

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "reg_transaction_id")
    private RegTransaction regTransaction;

    // Кто отправил деньги (или начал операцию)

    //БЫЛО ТАК
//    @OneToOne
//    @JoinColumn(name = "subject_id")
//    private Subject subjectSender;
    //СТАЛО ТАК

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_id")
    private Subject subjectSender;

    // Кто получил деньги (или был получателем в операции)
    //БЫЛО ТАК
//    @OneToOne
//    @JoinColumn(name = "subject_getter_id")
//    private Subject subjectGetter;
    //СТАЛО ТАК

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "subject_getter_id")
    private Subject subjectGetter;

}
