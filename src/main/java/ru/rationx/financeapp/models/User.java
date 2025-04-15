package ru.rationx.financeapp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.rationx.financeapp.models.role.RoleUser;

import java.util.Set;

@Data
@Entity
@Builder
@Table(name = "user_table")
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true)
    private String username;
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "m2m_role_table",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_id")
    )
    private Set<RoleUser> roleUsers;

    @Builder.Default
    private boolean enabled = true;
    @Builder.Default
    private boolean accountNonExpired = true;
    @Builder.Default
    private boolean credentialsNonExpired = true;
    @Builder.Default
    private boolean accountNonLocked = true;

}
