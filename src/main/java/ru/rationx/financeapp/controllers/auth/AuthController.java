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

@Controller
@AllArgsConstructor
public class AuthController {

     @Autowired
     private final RoleService roleService;

     @Autowired
     private final PasswordEncoder passwordEncoder;

     @Autowired
     private final UserRepository userRepository;


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

     @GetMapping("/register")
     public String showRegisterForm(Model model) {
         model.addAttribute("user", new User());
         return "auth/register";
     }
 
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

        return "redirect:/login";
    }

}
