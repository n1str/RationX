package ru.rationx.financeapp.models.role;

/**
 * Это пользовательское (кастомное) исключение выбрасывается,
 * если не найдена роль по умолчанию (например, при регистрации пользователя).
 * Это исключение для обработки ошибок, связанных с отсутствием стандартной роли.
 */
public class DefaultRoleNotFound extends RuntimeException {
    public DefaultRoleNotFound(String message) {
        super(message);
    }
}
