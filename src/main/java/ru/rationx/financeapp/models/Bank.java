package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Эта сущность описывает банк, связанный с участником финансовой операции.
 * Здесь хранятся название банка, счета и связь с владельцем (Subject).
 * Если нужно добавить новое поле для банка — тут.
 */
@Entity
@Data
public class Bank {
    @Id
    @GeneratedValue
    // Уникальный номер банка (создаётся автоматически)
    private Long id;

    // Название банка (например, "Сбербанк")
    private String nameBank;

    // Основной расчетный счет
    private String bill;
    // Расчетный счет
    private String rbill;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    // Владелец этого банка (участник операции)
    Subject subject;

}
