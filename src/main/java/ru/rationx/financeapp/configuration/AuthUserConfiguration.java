package ru.rationx.financeapp.configuration;

import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;


/**
 * Этот класс настраивает, как работает безопасность и авторизация в приложении.
 * Здесь описано, кто и как может заходить на разные страницы, как происходит вход/выход и как шифруются пароли.
 */
@Configuration
@RequiredArgsConstructor
public class AuthUserConfiguration {

    private final JwtAuthFilter jwtAuthFilter;


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
                .requestMatchers("/css/**", "/js/**", "/img/**").permitAll()
                .requestMatchers("/login", "/register").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
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

        .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    // 🔒 Если запрос к API — отдаем 401 вместо редиректа
                    if (request.getRequestURI().startsWith("/api")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Unauthorized: Invalid or missing JWT");
                    } else {
                        // 🔄 иначе редиректим как обычно
                        response.sendRedirect("/login");
                    }
                })
        )

        .logout(logout -> logout
            .logoutUrl("/logout") // URL выхода
            .logoutSuccessUrl("/login") // Куда перенаправить после выхода
            .permitAll()
            .invalidateHttpSession(true) // Сразу "забываем" пользователя
            .clearAuthentication(true) // Очищаем данные о входе
        );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
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
