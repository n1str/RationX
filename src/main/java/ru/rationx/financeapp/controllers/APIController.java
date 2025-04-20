package ru.rationx.financeapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

// Этот класс отвечает за обработку самых базовых запросов пользователя.
// Сюда попадают люди, когда только заходят на сайт или открывают страницу с транзакциями.
// Здесь только маршрутизация (направление пользователя на нужную страницу).
@Controller
public class APIController {
    // Этот метод срабатывает, когда человек заходит на главную страницу сайта ("/").
    // Возвращает название шаблона (index), который потом превращается в красивую страницу.
    @GetMapping("/")
    public String index(){
        // Просто отправляем пользователя на главную страницу (index.html)
        return "index";
    }

    // Этот метод нужен, чтобы показать пользователю страницу с транзакциями.
    // Если человек заходит по адресу "/transactions", он увидит список своих операций.
    @GetMapping("/transactions")
    public String transactions(){
        // Возвращаем шаблон transactions.html
        return "transactions";
    }


}
