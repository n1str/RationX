package ru.rationx.financeapp.models.dto.category;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import ru.rationx.financeapp.models.transaction.TransactionType;

@Data
@Getter
@Setter

public class CategoryDTO {
    private String nameCategory;
    private TransactionType transactionType;

}
