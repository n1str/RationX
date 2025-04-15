package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.role.DefaultRoleNotFound;
import ru.rationx.financeapp.models.role.RoleUser;
import ru.rationx.financeapp.repository.RoleRepository;

/**
 * Этот сервис отвечает за работу с ролями пользователей (например, USER, ADMIN).
 * Если нужно добавить новую роль или проверить существование — делается это здесь.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService {
    @Autowired
    RoleRepository roleRepository;

    /**
     * Ищет роль по названию. Если не найдена — выбрасывает исключение.
     * @param nameRole название роли (например, "USER")
     * @return объект RoleUser
     */
    public RoleUser findRole(String nameRole){
        return roleRepository
                .findByNameRole(nameRole)
                .orElseThrow(() -> new DefaultRoleNotFound(""));
    }
    /**
     * Проверяет наличие роли, если нет — создаёт новую.
     * @param arg название роли
     */
    public void checkRoleOrCreate(String arg){
        try {
            // вызываем
            RoleUser role = findRole(arg);
            log.info(String.format("Предустановленная роль: %s не удалена",role.getNameRole()));

        } catch (DefaultRoleNotFound ex){
            log.warn("Отсутствует предустановленная роль, создаём...");

            roleRepository.save(new RoleUser(arg));
        }
    }
}
