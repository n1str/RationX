package ru.rationx.financeapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Аннотация @Controller указывает, что этот класс является контроллером в архитектуре Spring MVC
@Controller
public class APIController {
    // Аннотация @GetMapping привязывает HTTP GET запросы к корневому пути "/" к этому методу
    @GetMapping("/")
    public String APIController(){
        // Возвращает имя представления "index", которое будет преобразовано в соответствующий HTML-шаблон
        return "index";
    }
}
