package ru.rationx.financeapp.models.dto.transaction;

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

    @NotNull(message = "Значение `personType` не может быть null или пустым ")
    private Subject.PersonType personType;

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String name;

    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull(message = "Значение `inn` не может быть null или пустым ")
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String inn;

    // Адрес участника
    @NotNull(message = "Значение `address` не может быть null или пустым ")
    private String address;

    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)

    @Pattern(regexp = "^(\\+7|8)\\d{10}$", message = "Телефон должен начинаться с +7 или 8 и содержать 11 цифр")
    private String phone;

    //
    @NotNull(message = "Значение `personTypeRecipient` не может быть null или пустым ")
    private Subject.PersonType personTypeRecipient;

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String nameRecipient;

    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull(message = "Значение `innRecipient` не может быть null или пустым ")
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String innRecipient;

    // Адрес участника
    private String addressRecipient;

    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)
    @Pattern(regexp = "^(\\+7|8)\\d{10}$", message = "Телефон должен начинаться с +7 или 8 и содержать 11 цифр")
    private String recipientPhoneRecipient;


    @NotNull(message = "Значение `nameBank` не может быть null или пустым ")
    private String nameBank;

        // Основной расчетный счет
        @NotNull(message = "Значение `bill` не может быть null или пустым ")
        private String bill;
        // Расчетный счет
        @NotNull(message = "Значение `rBill` не может быть null или пустым ")
        private String rBill;

    @NotNull(message = "Значение `nameBankRecip` не может быть null или пустым ")
    private String nameBankRecip;

        // Основной расчетный счет
        @NotNull(message = "Значение `billRecip` не может быть null или пустым ")
        private String billRecip;

        // Расчетный счет
        @NotNull(message = "Значение `rBillRecip` не может быть null или пустым ")
        private String rBillRecip;


    private String comment;

    @NotNull(message = "Значение `category` не может быть null или пустым ")
    private String category;

    @NotNull(message = "Значение `transactionType` не может быть null или пустым ")
    private TransactionType transactionType;

    @NotNull(message = "Значение `sum` не может быть null или пустым ")
    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "999999.99999", inclusive = true)
    @Digits(integer = 6, fraction = 5)
    @Column(nullable = false)
    private Double sum;

    @NotNull(message = "Значение `typeOperation` не может быть null или пустым ")
    private TransactionType typeOperation;

}
