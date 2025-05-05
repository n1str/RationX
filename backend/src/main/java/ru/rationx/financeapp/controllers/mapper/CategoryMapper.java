package ru.rationx.financeapp.controllers.mapper;

import org.springframework.stereotype.Component;
import ru.rationx.financeapp.models.dto.category.CategoryDTO;
import ru.rationx.financeapp.models.transaction.Category;

@Component
public class CategoryMapper {
    public Category mapToCategory(CategoryDTO categoryDTO ){
        return Category.builder()
                .name(categoryDTO.getNameCategory())
                .applicableType(categoryDTO.getTransactionType())
                .build();
    }
}
