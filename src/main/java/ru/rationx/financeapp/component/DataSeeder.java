package ru.rationx.financeapp.component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.rationx.financeapp.services.RoleService;


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
