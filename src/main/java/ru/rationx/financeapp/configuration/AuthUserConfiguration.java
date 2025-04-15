package ru.rationx.financeapp.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import ru.rationx.financeapp.exceptions.CustomAuthenticationFailureHandler;
import ru.rationx.financeapp.services.AuthUserService;


@Configuration
@RequiredArgsConstructor
public class AuthUserConfiguration{
    @Autowired
    private final AuthUserService userService;

    @Bean
    public SecurityFilterChain appSecurityConfiguration(HttpSecurity http) throws Exception {
        http.userDetailsService(userService);
        http.authorizeHttpRequests(
            auth -> auth

                .requestMatchers("/css/**", "/js/**", "/img/**").permitAll()
                .requestMatchers("/login","/register").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
        )
        .formLogin(form -> form
            .usernameParameter("username")
            .passwordParameter("password")
            .loginPage("/login")
            .defaultSuccessUrl("/",true)
            .failureHandler(new CustomAuthenticationFailureHandler())
            .permitAll()

        )
        .logout(logout -> logout
            .logoutUrl("/logout") // URL выхода
            .logoutSuccessUrl("/login") // Куда перенаправить после выхода
            .permitAll()
            .invalidateHttpSession(true) // Инвалидировать сессию
            .clearAuthentication(true) // Очистить аутентификацию
        );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
