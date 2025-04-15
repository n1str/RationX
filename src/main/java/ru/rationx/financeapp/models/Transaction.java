package ru.rationx.financeapp.models;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Transaction {

    public enum PersonType {
        PERSON_TYPE("Физическое лицо"),
        LEGAL_TYPE ("Юридическое лицо");

        public String ch;

        PersonType(String ch) {
            this.ch = ch;
        }
    }

    public enum TransactionType {
        ПОСТУПЛЕНИЕ, СПИСАНИЕ
    }

    public enum TransactionStatus {
        НОВАЯ,
        ПОДТВЕРЖДЕННАЯ,
        В_ОБРАБОТКЕ,
        ОТМЕНЕНА,
        ПЛАТЕЖ_ВЫПОЛНЕН,
        ПЛАТЕЖ_УДАЛЕН,
        ВОЗВРАТ
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
