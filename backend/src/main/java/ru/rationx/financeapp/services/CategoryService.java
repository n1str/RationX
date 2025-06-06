package ru.rationx.financeapp.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.models.transaction.exception.DoNotFoundCategory;
import ru.rationx.financeapp.repository.CategoryRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Сервис для работы с категориями транзакций
 */
@Service
@Slf4j
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    /**
     * Получить все категории
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    /**
     * Получить категории по типу транзакции (доход/расход)
     */
    public List<Category> getCategoriesByType(TransactionType type) {
        return categoryRepository.findByApplicableType(type);
    }
    
    /**
     * Получить категорию по ID
     */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Категория с ID " + id + " не найдена"));
    }
    
    /**
     * Создать новую категорию
    */


    public Category findOrCreateCategory(String category, TransactionType transactionType){
        try {
            // Сначала проверим, не является ли категория числом (то есть ID)
            try {
                Long categoryId = Long.parseLong(category);
                // Если это число, пробуем найти категорию по ID
                Optional<Category> existingCategory = categoryRepository.findById(categoryId);
                if (existingCategory.isPresent()) {
                    log.info("Найдена категория по ID: {}", categoryId);
                    return existingCategory.get();
                }
                // Если категория с таким ID не найдена, продолжаем и создадим категорию с правильным именем
                log.warn("Категория с ID {} не найдена, будет создана новая", categoryId);
            } catch (NumberFormatException e) {
                // Если это не число, продолжаем обычный поиск по имени
                log.debug("Передано не числовое значение для категории: {}", category);
            }
            
            // Пытаемся найти категорию по имени (игнорируя регистр)
            Category cat = categoryRepository.findByNameIgnoreCase(category)
                    .orElseThrow(() -> new DoNotFoundCategory("Категория не найдена"));
            return cat;

        } catch (DoNotFoundCategory ex) {
            log.info(ex.getMessage() + ": Создаем новую категорию - {}", category);
            Category cat = Category.builder()
                    .applicableType(transactionType)
                    .name(category)
                    .build();

            categoryRepository.save(cat);
            return cat;
        }
    }

    // Обновить данные с использованием Map

    public void updateCategoryMap(Map<String, Object> data, Category category) {
        if (data == null) {
            log.error("К сожалению входные данные не должны быть null");
            return;
        }

        if (String.valueOf(data.get("category")).isEmpty() || String.valueOf(data.get("type")).isEmpty()) {
            log.error("К сожалению входные данные не должны быть пуста");
            return;
        }

        if (String.valueOf(data.get("category")).equalsIgnoreCase(category.getName())) {
           log.warn("Такое наименование категории уже имеется в информационной базе. Попробуйте назвать иначе.");
        }

        category.setName(String.valueOf(data.get("category")));
        category.setApplicableType(TransactionType.valueOf(String.valueOf(data.get("type"))));

        categoryRepository.save(category);
        log.info("Сохранение категории успешно.");
    }


    @Transactional
    public Category createCategory(Category category) {
        // Проверяем, существует ли уже категория с таким именем
        Optional<Category> existing = categoryRepository.findByNameIgnoreCase(category.getName());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Категория с именем '" + category.getName() + "' уже существует");
        }
        
        return categoryRepository.save(category);
    }
    
    /**
     * Обновить существующую категорию
     */
    @Transactional
    public Category updateCategory(Long id, Category updatedCategory) {
        Category existing = getCategoryById(id);
        
        // Проверяем, не пытаемся ли мы переименовать в уже существующую категорию
        if (!existing.getName().equalsIgnoreCase(updatedCategory.getName())) {
            Optional<Category> duplicateCheck = categoryRepository.findByNameIgnoreCase(updatedCategory.getName());
            if (duplicateCheck.isPresent()) {
                throw new IllegalArgumentException("Категория с именем '" + updatedCategory.getName() + "' уже существует");
            }
        }
        
        existing.setName(updatedCategory.getName());
        existing.setApplicableType(updatedCategory.getApplicableType());
        
        return categoryRepository.save(existing);
    }
    
    /**
     * Удалить категорию по ID
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }

    /**
     * Создаёт категории по умолчанию, если они ещё не существуют
     */
    @Transactional
    public void createDefaultCategories() {
        // Расходные категории
        createCategoryIfNotExists("Продукты", TransactionType.CREDIT);
        createCategoryIfNotExists("Коммунальные услуги", TransactionType.CREDIT);
        createCategoryIfNotExists("Транспорт", TransactionType.CREDIT);
        createCategoryIfNotExists("Развлечения", TransactionType.CREDIT);
        createCategoryIfNotExists("Здоровье", TransactionType.CREDIT);
        createCategoryIfNotExists("Одежда", TransactionType.CREDIT);
        createCategoryIfNotExists("Образование", TransactionType.CREDIT);
        createCategoryIfNotExists("Прочие расходы", TransactionType.CREDIT);
        
        // Доходные категории
        createCategoryIfNotExists("Зарплата", TransactionType.DEBIT);
        createCategoryIfNotExists("Подработка", TransactionType.DEBIT);
        createCategoryIfNotExists("Инвестиции", TransactionType.DEBIT);
        createCategoryIfNotExists("Подарки", TransactionType.DEBIT);
        createCategoryIfNotExists("Прочие доходы", TransactionType.DEBIT);
    }
    
    private void createCategoryIfNotExists(String name, TransactionType type) {
        if (categoryRepository.findByNameIgnoreCase(name).isEmpty()) {
            Category category = new Category(name, type);
            categoryRepository.save(category);
        }
    }
}
