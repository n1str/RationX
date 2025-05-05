package ru.rationx.financeapp.controllers.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import ru.rationx.financeapp.models.dto.LoginRequest;
import ru.rationx.financeapp.models.dto.LoginResponse;
import ru.rationx.financeapp.models.dto.RegisterRequest;
import ru.rationx.financeapp.models.dto.ResponseDTO;
import ru.rationx.financeapp.models.user.User;
import ru.rationx.financeapp.models.role.RoleUser;
import ru.rationx.financeapp.repository.UserRepository;
import ru.rationx.financeapp.services.AuthUserService;
import ru.rationx.financeapp.services.RoleService;
import ru.rationx.financeapp.services.jwt.JwtService;

import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final AuthUserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleService roleService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        log.info("Login attempt for user: {}", request.username());

        try {
            // Аутентификация пользователя
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            log.info("User authenticated successfully: {}", request.username());
            UserDetails user = (UserDetails) authentication.getPrincipal();

            // Генерация токена
            String token = jwtService.generateToken(user);
            log.info("Generated JWT token for user: {}", request.username());

            // Создаем cookie для хранения токена
            Cookie jwtCookie = new Cookie("token", token);
            jwtCookie.setHttpOnly(true);               // Ограничение доступа к cookie с JavaScript для повышения безопасности
            jwtCookie.setSecure(true);                      // Если ваше приложение работает по HTTPS
            jwtCookie.setPath("/");                         // Доступ на все пути API
            jwtCookie.setMaxAge(60 * 60);                       // Например, 1 час (в секундах)

            // Добавляем cookie в ответ
            response.addCookie(jwtCookie);

            // Возвращаем JSON-ответ, включая токен в тело ответа
            return ResponseEntity.ok(Map.of(
                "message", "Успешный вход в систему",
                "token", token,
                "username", request.username()
            ));
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user {}: bad credentials", request.username());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Неверные учетные данные"));
        } catch (Exception e) {
            log.error("Error during authentication for user {}: {}", request.username(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка при аутентификации: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        log.info("Registration attempt for user: {}", request.username());

        // Проверяем, что пользователь с таким именем еще не существует
        if (userRepository.findByUsername(request.username()).isPresent()) {
            log.warn("Registration failed: username '{}' already exists", request.username());
            return ResponseEntity.badRequest().body(Map.of("error", "Пользователь с таким именем уже существует"));
        }

//        try {
        // Получаем роль USER (или создаем, если её нет)
        RoleUser userRole = roleService.findRole("USER");
        log.debug("Found USER role for new user");

        // Создаем нового пользователя
        User newUser = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .roleUsers(Set.of(userRole))
                .enabled(true)
                .build();

        // Сохраняем пользователя
        userRepository.save(newUser);
        log.info("Пользователь был : {}", request.username());

//            // Возвращаем JWT токен // под вопросом (matthewencore)
//            UserDetails userDetails = userService.loadUserByUsername(request.username());
//            String token = jwtService.generateToken(userDetails);
//            log.info("Generated JWT token for new user: {}", request.username());
//
//            // под вопросом (matthewencore)
//
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDTO.builder()
                        .code(HttpStatus.CREATED.toString())
                        .message("Пользователь был создан")
                        .build());
//        } catch (Exception e) {
//            log.error("Error during registration for user {}: {}", request.username(), e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", "Ошибка при регистрации: " + e.getMessage()));
//        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody String token) {
        log.info("Token validation request received");

        try {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userService.loadUserByUsername(username);
            boolean isValid = jwtService.isTokenValid(token, userDetails);

            log.info("Token validation result for user {}: {}", username, isValid);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (UsernameNotFoundException e) {
            log.warn("Token validation failed: user not found");
            return ResponseEntity.ok(Map.of("valid", false, "error", "User not found"));
        } catch (Exception e) {
            log.error("Error during token validation: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("valid", false, "error", e.getMessage()));
        }
    }
}
