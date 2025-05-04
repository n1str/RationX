package ru.rationx.financeapp.models.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ru.rationx.financeapp.models.subject.Subject;
import ru.rationx.financeapp.models.transaction.TransactionStatus;
import ru.rationx.financeapp.models.transaction.TransactionType;
/*

    // Связь с детальной информацией о транзакции (сумма, тип - дебет/кредит)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "reg_transaction_id")
    private RegTransaction regTransaction;

    // Кто отправил деньги (или начал операцию)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "subject_id")
    private Subject subjectSender;

    // Кто получил деньги (или был получателем в операции)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "subject_getter_id")
    private Subject subjectGetter;

    // Инициатор операции
    @NotNull
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
*
* */

@Builder
@Data
@Getter
@Setter
public class TransactionDTO {

    TransactionStatus status;

    @NotNull
    private Subject.PersonType personType;

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String name;

    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String inn;

    // Адрес участника
    private String address;

    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)
    @Pattern(regexp = "^(\\+7|8)\\d{10}$", message = "Телефон должен начинаться с +7 или 8 и содержать 11 цифр")
    private String phone;

    //
    @NotNull
    private Subject.PersonType personTypeRecipient;

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String nameRecipient;

    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String innRecipient;

    // Адрес участника
    private String addressRecipient;

    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)
    @Pattern(regexp = "^(\\+7|8)\\d{10}$", message = "Телефон должен начинаться с +7 или 8 и содержать 11 цифр")
    private String recipientPhoneRecipient;


    @NotNull
    private String nameBank;

        // Основной расчетный счет
        private String bill;
        // Расчетный счет
        private String rBill;

    @NotNull
    private String nameBankRecip;

        // Основной расчетный счет
        @NotNull
        private String billRecip;

        // Расчетный счет
        @NotNull
        private String rBillRecip;


    private String comment;

    @NotNull
    private String category;

    @NotNull
    private TransactionType transactionType;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "999999.99999", inclusive = true)
    @Digits(integer = 6, fraction = 5)
    @Column(nullable = false)
    private Double sum;

    @NotNull
    private TransactionType typeOperation;

}
