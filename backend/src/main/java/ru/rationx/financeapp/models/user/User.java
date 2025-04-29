package ru.rationx.financeapp.models.user;

import jakarta.persistence.*;
import lombok.*;
import ru.rationx.financeapp.models.role.RoleUser;

import java.util.Set;

/**
 * Эта сущность описывает пользователя системы.
 * Здесь хранятся имя пользователя, пароль, роли и статус.
 * Если нужно добавить новое поле для пользователя — тут.
 */
@Entity
@Builder
@Table(name = "user_table")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue
    // Уникальный номер пользователя (создаётся автоматически)
    private Long id;

    @Column(unique = true)
    // Имя пользователя (логин)
    private String username;
    // Пароль пользователя (хранится в зашифрованном виде)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "m2m_role_table",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_id")
    )
    // Роли пользователя (например, USER, ADMIN)
    private Set<RoleUser> roleUsers;

    @Builder.Default
    // Аккаунт включён (можно входить)
    private boolean enabled = true;
    @Builder.Default
    // Срок действия аккаунта не истёк
    private boolean accountNonExpired = true;
    @Builder.Default
    // Учётные данные (пароль) не истекли
    private boolean credentialsNonExpired = true;
    @Builder.Default
    // Аккаунт не заблокирован
    private boolean accountNonLocked = true;

}
