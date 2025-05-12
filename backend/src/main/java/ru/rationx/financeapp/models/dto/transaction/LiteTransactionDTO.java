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

@Builder
@Data
@Getter
@Setter
public class LiteTransactionDTO {
    Long id;

    TransactionStatus status;

    @NotNull(message = "Значение `personType` не может быть null или пустым ")
    private Subject.PersonType personType;
    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String name;
    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull(message = "Значение `inn` не может быть null или пустым ")
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String inn;
    // Адрес отправителя
    private String address;
    // Телефон отправителя
    private String phone;

    // Данные банка отправителя
    private String nameBankSender;
    private String billSender;
    private String rBillSender;

    @NotNull(message = "Значение `personTypeRecipient` не может быть null или пустым ")
    private Subject.PersonType personTypeRecipient;
    private String nameRecipient;
    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull(message = "Значение `inn` не может быть null или пустым ")
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String innRecipient;
    // Адрес получателя
    private String addressRecipient;
    // Телефон получателя
    private String phoneRecipient;

    // Данные банка получателя
    private String nameBankRecipient;
    private String billRecipient;
    private String rBillRecipient;

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
