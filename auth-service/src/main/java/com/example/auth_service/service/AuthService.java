package com.example.auth_service.service;
// src/main/java/com/example/auth_service/service/AuthService.java

import com.example.auth_service.dto.SyncUserRequest;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public User syncUser(SyncUserRequest request) {
        log.info("🔄 Synchronisation utilisateur: {}", request.getEmail());

        User user = userRepository.findByClerkId(request.getClerkId())
                .orElse(new User());

        // Mettre à jour les informations
        user.setClerkId(request.getClerkId());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setImageUrl(request.getImageUrl());

        // Gérer le rôle
        if (request.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(User.Role.MEMBER);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("✅ Utilisateur synchronisé: {} (ID: {})", savedUser.getEmail(), savedUser.getId());

        return savedUser;
    }

    public User getUserByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}