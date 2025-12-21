package com.example.auth_service.repository;

import com.example.auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByClerkId(String clerkId);

    Optional<User> findByEmail(String email);

    boolean existsByClerkId(String clerkId);

    boolean existsByEmail(String email);
}
