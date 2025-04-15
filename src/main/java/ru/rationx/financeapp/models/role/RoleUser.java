package ru.rationx.financeapp.models.role;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.rationx.financeapp.models.User;

import java.util.List;

/**
 * Эта сущность описывает роль пользователя (например, USER или ADMIN).
 * Если нужно добавить новую роль — тут.
 * У каждой роли есть уникальное имя и список пользователей, которым она назначена.
 */
@Entity
@Getter
@Setter
public class RoleUser {
    @Id
    @GeneratedValue
    // Уникальный номер роли (создаётся автоматически)
    private Long id;

    @Column(unique = true)
    // Название роли (например, "USER")
    private String nameRole;

    @ManyToMany(mappedBy = "roleUsers")
    // Список пользователей, у которых есть эта роль
    List<User> userList;

    // Конструктор для создания новой роли по имени
    public RoleUser(String nameRole) {
        this.nameRole = nameRole;
    }

    // Пустой конструктор для JPA
    public RoleUser() {

    }
}
