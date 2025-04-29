package ru.rationx.financeapp.configuration;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import ru.rationx.financeapp.services.AuthUserService;

/**
 * Этот класс настраивает, как работает безопасность и авторизация в приложении.
 * Здесь настраивается JWT авторизация для API
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class AuthUserConfiguration {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthUserService userService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain");
        
        return http
            // Отключаем CSRF для REST API
            .csrf(AbstractHttpConfigurer::disable)
            
            // Настраиваем политику безопасности для запросов
            .authorizeHttpRequests(auth -> {

                // Публичные эндпоинты (не требуют аутентификации)
                auth.requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll();
                auth.requestMatchers(new AntPathRequestMatcher("/api/test/public")).permitAll();

                // Защищенные эндпоинты (требуют аутентификации)
                auth.requestMatchers(new AntPathRequestMatcher("/api/**")).authenticated();
                // Все остальные запросы требуют аутентификации

                auth.anyRequest().authenticated();
            })
            

            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Настраиваем провайдер аутентификации
            .authenticationProvider(authenticationProvider())

            // Добавляем JWT фильтр перед стандартным фильтром аутентификации
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // Строим конфигурацию
            .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService);
        provider.setPasswordEncoder(passwordEncoder());
        log.info("Configured DaoAuthenticationProvider with userService and passwordEncoder");
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        AuthenticationManager manager = config.getAuthenticationManager();
        log.info("Configured AuthenticationManager");
        return manager;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("Created BCryptPasswordEncoder");
        return new BCryptPasswordEncoder();
    }
}
