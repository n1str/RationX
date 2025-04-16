package ru.rationx.financeapp.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import ru.rationx.financeapp.exceptions.CustomAuthenticationFailureHandler;
import ru.rationx.financeapp.services.AuthUserService;

/**
 * Этот класс настраивает, как работает безопасность и авторизация в приложении.
 * Здесь описано, кто и как может заходить на разные страницы, как происходит вход/выход и как шифруются пароли.
 */
@Configuration
@RequiredArgsConstructor
public class AuthUserConfiguration {
    
    // Сервис, который отвечает за работу с пользователями (поиск, проверка пароля и т.д.)
    private final AuthUserService userService;

    /**
     * Основная настройка безопасности приложения.
     * Здесь указывается, какие страницы доступны всем, а какие — только авторизованным.
     * Также настраивается форма входа, выход и обработка ошибок входа.
     */
    @Bean
    public SecurityFilterChain appSecurityConfiguration(HttpSecurity http) throws Exception {
        http.userDetailsService(userService);

        // Настраиваем CSRF защиту через куки и отключаем её для API запросов
        http.csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/**") // Отключаем CSRF для API
        );

        http.authorizeHttpRequests(
            auth -> auth
                // Эти папки (css, js, img) доступны всем, даже если не вошёл в систему
                .requestMatchers("/css/**", "/js/**", "/img/**").permitAll()
                // Страницы входа и регистрации доступны всем
                .requestMatchers("/login", "/register").permitAll()
                // API для работы с транзакциями и категориями - только для аутентифицированных пользователей
                .requestMatchers("/api/**").authenticated()
                // Все остальные страницы - только для аутентифицированных пользователей
                .anyRequest().authenticated()
        )
        .formLogin(form -> form
            .usernameParameter("username")
            .passwordParameter("password")
            .loginPage("/login")
            .defaultSuccessUrl("/", true)
            // Если не получилось войти — используем свой обработчик ошибок
            .failureHandler(new CustomAuthenticationFailureHandler())
            .permitAll()
        )
        .logout(logout -> logout
            .logoutUrl("/logout") // URL выхода
            .logoutSuccessUrl("/login") // Куда перенаправить после выхода
            .permitAll()
            .invalidateHttpSession(true) // Сразу "забываем" пользователя
            .clearAuthentication(true) // Очищаем данные о входе
        );

        return http.build();
    }

    /**
     * Здесь настраивается шифровка паролей.
     * Все пароли в базе хранятся не в чистом виде, а в виде "зашифрованной каши" (bcrypt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
