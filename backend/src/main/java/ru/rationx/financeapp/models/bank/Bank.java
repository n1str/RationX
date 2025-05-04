package ru.rationx.financeapp.models.bank;

import jakarta.persistence.*;
import lombok.*;
import ru.rationx.financeapp.models.subject.Subject;

/**
 * Эта сущность описывает банк, связанный с участником финансовой операции.
 * Здесь хранятся название банка, счета и связь с владельцем (Subject).
 * Если нужно добавить новое поле для банка — тут.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Уникальный номер банка (создаётся автоматически)
    private Long id;

    // Название банка (например, "Сбербанк")
    private String nameBank;

    // Основной расчетный счет
    @Column(unique = true)
    private String bill;
    // Расчетный счет
    @Column(unique = true)
    private String rbill;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    // Владелец этого банка (участник операции)
    private Subject subject;

}
