package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

/**
 * Эта сущность описывает участника финансовой операции (например, отправителя или получателя).
 * Здесь хранятся имя, ИНН, адрес, телефон и тип участника (физлицо или юрлицо).
 */
@Entity
@Data
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Уникальный номер участника (создаётся автоматически)
    private Long id;

    public enum PersonType {
        PERSON_TYPE("Физическое лицо"),
        LEGAL_TYPE("Юридическое лицо");

        private final String description;

        PersonType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String name;

    // ИНН участника (обязательное поле, для физлиц - 12 цифр, для юрлиц - 10 цифр)
    @NotNull
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    private String inn;

    // Адрес участника
    private String address;

    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)
    @Pattern(regexp = "^(\\+7|8)\\d{10}$", message = "Телефон должен начинаться с +7 или 8 и содержать 11 цифр")
    private String recipientPhone;

    @NotNull
    @Enumerated(EnumType.STRING)
    // Тип участника: физлицо или юрлицо
    private PersonType personType;

    // Банки, связанные с этим участником
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "subject")
    private List<Bank> bank;
}
