package ru.rationx.financeapp.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.models.dto.category.CategoryDTO;
import ru.rationx.financeapp.controllers.mapper.CategoryMapper;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.services.CategoryService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для работы с категориями транзакций через API
 */
@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // мапперы
    private final CategoryMapper categoryMapper;

    /**
     * Получить все категории
     */
    @GetMapping
    public ResponseEntity<?> getAllCategories(Principal principal) {
        try {
            log.info("GET /api/categories - User: {}", principal.getName());
            
            List<Category> categories = categoryService.getAllCategories();
            log.info("Retrieved {} categories", categories.size());
            return ResponseEntity.ok(categories);

        } catch (Exception e) {
            log.error("Error retrieving all categories: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении категорий: " + e.getMessage()));
        }
    }

    /**
     * Получить категории по типу транзакции (доход/расход)
     */
    @GetMapping("/by-type")
    public ResponseEntity<?> getCategoriesByType(@RequestParam TransactionType type,
             Principal principal) {
        try {

            log.info("GET /api/categories/by-type - Пользователь: {}, Тип: {}", principal.getName(), type);

            List<Category> categories = categoryService.getCategoriesByType(type);
            log.info("Retrieved {} categories with type {}", categories.size(), type);
            
            return ResponseEntity.ok(categories);

        } catch (Exception e) {
            log.error("Error retrieving categories by type {}: {}", type, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении категорий по типу: " + e.getMessage()));
        }
    }

    /**
     * Получить категорию по ID*/

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id,
         Principal principal) {
        try {
            log.info("GET /api/categories/{} - User: {}", id, principal.getName());
            
            Category category = categoryService.getCategoryById(id);
            if (category != null) {
                log.info("Retrieved category with ID {}", id);
                return ResponseEntity.ok(category);
            } else {
                log.info("Category with ID {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Категория не найдена"));
            }
        } catch (Exception e) {
            log.error("Error retrieving category with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при получении категории: " + e.getMessage()));
        }
    }

    /**
     * Создать новую категорию
     */

    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@RequestBody CategoryDTO category , Principal principal) {
        try {
            log.info("POST /api/categories - User: {}", principal.getName());

            // маппим в Category скрываем нашу модель
            Category savedCategory = categoryService.createCategory(
                    categoryMapper.mapToCategory(category));

            log.info("Created category with ID {}", savedCategory.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);

        } catch (Exception e) {
            log.error("Error creating category: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ошибка при создании категории: " + e.getMessage()));
        }
    }

    /**
     * Обновить существующую категорию
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO updatedCategory,
        Principal principal) {
        try {
            log.info("PUT /api/categories/{} - User: {}", id, principal.getName());
            
            Category category = categoryService.updateCategory(
                    id, categoryMapper.mapToCategory(updatedCategory));
            log.info("Updated category with ID {}", id);
            
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            log.error("Error updating category with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ошибка при обновлении категории: " + e.getMessage()));
        }
    }

    /**
     * Удалить категорию
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("DELETE /api/categories/{} - User: {}", id, auth.getName());
            
            categoryService.deleteCategory(id);
            log.info("Category with ID {} successfully deleted", id);
            
            return ResponseEntity.ok(Map.of("message", "Категория успешно удалена"));
        } catch (Exception e) {
            log.error("Error deleting category with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при удалении категории: " + e.getMessage()));
        }
    }
}
