package ru.rationx.financeapp.models.dto.statistic;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/*
     Map<String, Object> statistics = new HashMap<>();
    statistics.put("totalIncome", 150000.0);
    statistics.put("totalExpense", 85000.0);
    statistics.put("balance", 65000.0);
    statistics.put("transactionCount", 42);
 */


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatisticDTO {
    @NotNull
    private String type;

    @NotNull
    private Double sum;


}
