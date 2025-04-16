package ru.rationx.financeapp.models.transaction;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Эта сущность описывает запись о движении средств (регистрация транзакции).
 * Здесь хранится информация о типе операции (дебет/кредит), сумме и дате.
 * Если нужно добавить новое поле — тут.
 */
@Builder
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegTransaction {
    /**
     * Уникальный номер этой записи (создаётся автоматически)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Тип операции: дебет или кредит (берётся из специального перечисления TransactionType)
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    /**
     * Сумма операции (например, сколько денег перевели)
     * Согласно ТЗ, должна иметь точность до 5 знаков
     */
    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "999999.99999", inclusive = true)
    @Digits(integer = 6, fraction = 5)
    @Column(nullable = false)
    private Double sum;

    /**
     * Дата, когда произошла операция (по умолчанию — сегодня)
     */
    @Builder.Default
    private LocalDate date = LocalDate.now();
}
