package ru.rationx.financeapp.models.transaction;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import ru.rationx.financeapp.models.Subject;

import java.time.LocalDateTime;

@Data
@Entity
public class Transaction {

    @Id
    @GeneratedValue
    private Long id;

    // Статус транзакции
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
    private TransactionStatus status;

    // -----------------

    // Банк

    //------------------

    @NotNull
    private LocalDateTime dateTime;

    private String comment; // комментарий к транзакции

    //  one to one

    // Регистр дебет/кредит
    @OneToOne
    @JoinColumn(name = "reg_transaction_id")
    private RegTransaction regTransaction;

    // Субъект отправителя
    @OneToOne
    @JoinColumn(name = "subject_id")
    private Subject subjectSender;

    // Cубъект получателя
    @OneToOne
    @JoinColumn(name = "subject_getter_id")
    private Subject subjectGetter;

}
