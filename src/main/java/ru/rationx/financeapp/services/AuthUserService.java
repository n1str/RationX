package ru.rationx.financeapp.services;

import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.rationx.financeapp.repository.UserRepository;


@Service
@AllArgsConstructor
public class AuthUserService implements UserDetailsService {
    private UserRepository repository;

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
