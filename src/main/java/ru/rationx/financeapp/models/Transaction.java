package ru.rationx.financeapp.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Transaction {

    @Id
    @GeneratedValue
    private Long id;

    public enum PersonType {
        PERSON_TYPE("Физическое лицо"),
        LEGAL_TYPE ("Юридическое лицо");

        public String ch;

        PersonType(String ch) {
            this.ch = ch;
        }
    }

    public enum TransactionType {
        DEBIT("Поступление"),
        CREDIT("Расход");

        public String ch;
        TransactionType(String ch) {
            this.ch = ch;
        }
    }

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
    private PersonType personType;

    @NotNull
    private LocalDateTime dateTime;

    @NotNull
    private TransactionType transactionType;

    private String comment;

    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "999999.99", inclusive = true)
    @Digits(integer = 6, fraction = 2)
    @NotNull
    private Double amount;

    @NotNull
    private TransactionStatus status;

    @NotBlank
    private String senderBank;

    @NotBlank
    private String accountNumber;

    @NotBlank
    private String recipientBank;

    @Pattern(regexp = "\\d{11}")
    private String recipientInn;

    private String recipientAccount;

    @NotBlank
    private String category;

    @Pattern(regexp = "^(\\+7|8)\\d{10}$")
    private String recipientPhone;
}
