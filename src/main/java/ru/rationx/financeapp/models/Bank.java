package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Bank {
    @Id
    @GeneratedValue
    private Long id;

    private String nameBank;

    private String bill;
    private String rbill;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    Subject subject;

}
