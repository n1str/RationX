package ru.rationx.financeapp.controllers.auth;

import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.rationx.financeapp.models.User;
import ru.rationx.financeapp.models.role.RoleUser;
import ru.rationx.financeapp.repository.UserRepository;
import ru.rationx.financeapp.services.RoleService;

import java.util.Set;

/**
 * Этот контроллер отвечает за вход и регистрацию пользователей.
 * Проще говоря: всё, что связано с авторизацией — обработка форм, создание новых пользователей и т.д.
 * Если пользователь ошибся при входе — выводится сообщение об ошибке.
 * Здесь же происходит сохранение нового пользователя в базу данных.
 */
@Controller
@AllArgsConstructor
public class AuthController {

     @Autowired
     // Сервис для работы с ролями пользователей (например, роль "USER")
     private final RoleService roleService;

     @Autowired
     // Кодировщик паролей (делает пароли безопасными для хранения)
     private final PasswordEncoder passwordEncoder;

     @Autowired
     // Репозиторий для работы с пользователями (сохранение, поиск)
     private final UserRepository userRepository;

    /**
     * Показывает форму входа.
     * Если была ошибка — выводит сообщение об ошибке.
     */
    @GetMapping("/login")
    public String showLoginForm(@RequestParam(value = "error", required = false) String error,
                                HttpSession session, Model model) {
        if (error != null) {
            String errorMessage = (String) session.getAttribute("SPRING_SECURITY_LAST_EXCEPTION");
            model.addAttribute("error", errorMessage);
            session.removeAttribute("SPRING_SECURITY_LAST_EXCEPTION");
        }
        return "auth/login";
    }

     /**
      * Показывает форму регистрации нового пользователя.
      */
     @GetMapping("/register")
     public String showRegisterForm(Model model) {
         model.addAttribute("user", new User());
         return "auth/register";
     }
 
     /**
      * Обрабатывает отправку формы регистрации.
      * Создаёт нового пользователя, шифрует пароль, назначает роль и сохраняет в базу.
      * После успешной регистрации перенаправляет на страницу входа.
      */
     @PostMapping("/register")
     public String register(@ModelAttribute User user) {
         RoleUser userRole = roleService.findRole("USER");

         User newUser = User.builder()
            .password(passwordEncoder.encode(user.getPassword()))
            .username(user.getUsername())
            .roleUsers(Set.of(userRole))
            .enabled(true)
            .build();

         userRepository.save(newUser);

         return "redirect:/dashboard";
    }

}
