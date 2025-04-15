package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

/**
 * Эта сущность описывает участника финансовой операции (например, отправителя или получателя).
 * Здесь хранятся имя, ИНН, адрес, телефон и тип участника (физлицо или юрлицо).
 * Если нужно добавить новое поле для участника — тут.
 */
@Entity
public class Subject {
    @Id
    @GeneratedValue
    // Уникальный номер участника (создаётся автоматически)
    private Long id;

    public enum PersonType {
        PERSON_TYPE("Физическое лицо"),
        LEGAL_TYPE ("Юридическое лицо");

        public String ch;

        PersonType(String ch) {
            this.ch = ch;
        }
    }

    // Имя участника (например, Иван Иванов или ООО "Ромашка")
    private String name;

    @NotNull
    // ИНН участника (обязательное поле)
    private String inn;

    @NotNull
    // Адрес участника
    private String address;

    @NotBlank
    @Pattern(regexp = "^(\\+7|8)\\d{10}$")
    // Телефон получателя (в формате +7XXXXXXXXXX или 8XXXXXXXXXX)
    private String recipientPhone;

    @NotNull
    @Enumerated(EnumType.ORDINAL)
    // Тип участника: физлицо или юрлицо
    private PersonType personType;

    // Банки, связанные с этим участником
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "subject")
    private List<Bank> bank;
}
