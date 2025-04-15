package ru.rationx.financeapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Главный класс запуска приложения FinanceApp.
 * Именно отсюда стартует всё приложение Spring Boot.
 */
@SpringBootApplication
public class FinanceAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceAppApplication.class, args);
    }

}
