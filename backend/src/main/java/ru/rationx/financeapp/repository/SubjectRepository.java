package ru.rationx.financeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.rationx.financeapp.models.subject.Subject;

import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByName(String name);
    Optional<Subject> findByName(String name);
    Optional<Subject> findByInn(String inn);
}
