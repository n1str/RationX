package ru.rationx.financeapp.models.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

/*
     Map<String, Object> statistics = new HashMap<>();
    statistics.put("totalIncome", 150000.0);
    statistics.put("totalExpense", 85000.0);
    statistics.put("balance", 65000.0);
    statistics.put("transactionCount", 42);
 */

@Data
@Builder
@Getter
@Setter
public class StatisticDTO {
    @NotNull
    private Double totalIncome;

    @NotNull
    private Double totalExpense;

    @NotNull
    private Double balance;

    @NotNull
    private Long transactionCount;


}
