package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.rationx.financeapp.models.role.RoleUser;

import java.util.Optional;

/**
 * Репозиторий для работы с ролями пользователей.
 * Здесь можно искать роли по названию или сохранять новые роли в базе.
 * Если нужно найти роль по имени — findByNameRole().
 */
public interface RoleRepository extends JpaRepository<RoleUser, Long> {
    /**
     * Ищет роль по названию (например, "USER" или "ADMIN").
     * @param nameRole название роли
     * @return Optional<RoleUser> — либо роль, либо пусто
     */
    public Optional<RoleUser> findByNameRole(String nameRole);
}
