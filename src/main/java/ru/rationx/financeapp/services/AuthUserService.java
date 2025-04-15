package ru.rationx.financeapp.services;

import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.repository.UserRepository;

/**
 * Этот сервис нужен для интеграции с системой безопасности Spring.
 * Он отвечает за то, чтобы система могла "узнать" пользователя по имени при входе.
 * Если пользователь найден — возвращает его данные и роли.
 * Если нет — выбрасывает ошибку.
 */
@Service
@AllArgsConstructor
public class AuthUserService implements UserDetailsService {
    // Репозиторий для поиска пользователей в базе
    private UserRepository repository;

    /**
     * Метод, который ищет пользователя по имени для Spring Security.
     * Если пользователь найден — возвращает UserDetails с ролями.
     * Если не найден — бросает ошибку (выведется сообщение об ошибке при входе).
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .map(user -> User.withUsername(user.getUsername())
                        .password(user.getPassword())
                        .authorities(user.getRoleUsers()
                                        .stream()
                                        .map(roleUser -> new SimpleGrantedAuthority("ROLE_" + roleUser.getNameRole())).toList())
                        .disabled(!user.isEnabled())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не был найден"));
    }
}
