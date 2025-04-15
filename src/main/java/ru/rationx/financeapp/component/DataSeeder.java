package ru.rationx.financeapp.component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.rationx.financeapp.services.RoleService;

/**
 * Этот компонент автоматически запускается при старте приложения.
 * Он проверяет, есть ли в базе роли ADMIN и USER, и если их нет — создаёт их.
 * Это нужно для корректной работы системы ролей и авторизации.
 * Если потребуется добавить новые роли по умолчанию — тут.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    @Autowired
    RoleService roleService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Проверяем целостность таблицы с ролями");

        roleService.checkRoleOrCreate("ADMIN");
        roleService.checkRoleOrCreate("USER");

    }
}
