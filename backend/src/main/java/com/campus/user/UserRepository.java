package com.campus.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByNameIgnoreCaseAndEmail(String name, String email);
    boolean existsByEmail(String email);

    long countByRole(UserRole role);

    long countByBlockedTrue();
}
