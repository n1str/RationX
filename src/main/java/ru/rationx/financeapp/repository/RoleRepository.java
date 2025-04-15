package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.rationx.financeapp.models.role.RoleUser;


import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleUser, Long> {
    public Optional<RoleUser> findByNameRole(String nameRole);
}
