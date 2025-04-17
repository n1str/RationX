package ru.rationx.financeapp.models.transaction;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Сущность, представляющая категорию для транзакций.
 * Например: Продукты, Коммунальные услуги, Зарплата и т.д.
 *
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    // Тип категории (для доходов или расходов)
    @Enumerated(EnumType.STRING)
    private TransactionType applicableType;
    
    // Конструктор для удобства создания категорий
    public Category(String name, TransactionType applicableType) {
        this.name = name;
        this.applicableType = applicableType;
    }
}
