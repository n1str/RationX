package ru.rationx.financeapp.services;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.rationx.financeapp.models.transaction.Category;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

/**
 * Сервис для работы с категориями транзакций
 */
@Service
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
