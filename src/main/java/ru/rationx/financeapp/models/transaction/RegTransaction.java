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


@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class RegTransaction {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.ORDINAL)
    private TransactionType transactionType;


    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "999999.99", inclusive = true)
    @Digits(integer = 6, fraction = 2)
    @Column(nullable = false)
    private Double sum;

    @Builder.Default
    private LocalDate date = LocalDate.now();
}
