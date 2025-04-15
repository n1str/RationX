package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

@Entity
public class Subject {
    @Id
    @GeneratedValue
    private Long id;

    public enum PersonType {
        PERSON_TYPE("Физическое лицо"),
        LEGAL_TYPE ("Юридическое лицо");

        public String ch;

        PersonType(String ch) {
            this.ch = ch;
        }
    }

    private String name;

    @NotNull
    private String inn;

    @NotNull
    private String address;

    @NotBlank
    @Pattern(regexp = "^(\\+7|8)\\d{10}$")
    private String recipientPhone;

    @NotNull
    @Enumerated(EnumType.ORDINAL)
    private PersonType personType;

    // Банки
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "subject")
    private List<Bank> bank;
}
