package ru.rationx.financeapp.component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.rationx.financeapp.services.CategoryService;
import ru.rationx.financeapp.services.RoleService;

/**
 * Этот компонент автоматически запускается при старте приложения.
 * Он проверяет, есть ли в базе роли ADMIN и USER, и если их нет — создаёт их.
 * Также создаёт категории доходов и расходов по умолчанию.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    
    private final RoleService roleService;
    private final CategoryService categoryService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Проверяем целостность таблицы с ролями");
        roleService.checkRoleOrCreate("ADMIN");
        roleService.checkRoleOrCreate("USER");
        
        log.info("Создаём категории по умолчанию");
        categoryService.createDefaultCategories();
    }
}
