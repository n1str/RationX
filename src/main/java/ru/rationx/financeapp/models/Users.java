package ru.rationx.financeapp.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;


@Data
@Entity
public class Users {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

}
