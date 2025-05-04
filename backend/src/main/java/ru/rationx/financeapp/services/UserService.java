package ru.rationx.financeapp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.models.user.User;
import ru.rationx.financeapp.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUser(String s){
        return userRepository.findByUsername(s)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь по такому username не найден"));
    }
}
