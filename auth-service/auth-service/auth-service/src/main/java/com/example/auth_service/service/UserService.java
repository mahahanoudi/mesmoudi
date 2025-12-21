package com.example.auth_service.service;

import com.example.auth_service.dto.SyncUserRequest;
import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.model.User;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserDTO syncUser(SyncUserRequest request) {
        log.info("Synchronizing user: {}", request.getEmail());

        User user = userRepository.findByClerkId(request.getClerkId())
                .map(existingUser -> {
                    // Mise à jour de l'utilisateur existant
                    existingUser.setEmail(request.getEmail());
                    existingUser.setFirstName(request.getFirstName());
                    existingUser.setLastName(request.getLastName());
                    existingUser.setImageUrl(request.getImageUrl());
                    if (request.getRole() != null && !request.getRole().isEmpty()) {
                        existingUser.setRole(request.getRole());
                    }
                    log.info("User updated: {}", request.getEmail());
                    return existingUser;
                })
                .orElseGet(() -> {
                    // Création d'un nouvel utilisateur
                    User newUser = User.builder()
                            .clerkId(request.getClerkId())
                            .email(request.getEmail())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .imageUrl(request.getImageUrl())
                            .role(request.getRole() != null ? request.getRole() : "Member")
                            .active(true)
                            .build();
                    log.info("New user created: {}", request.getEmail());
                    return newUser;
                });

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO getUserByClerkId(String clerkId) {
        log.info("Getting user by clerkId: {}", clerkId);
        return userRepository.findByClerkId(clerkId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("User not found with clerkId: " + clerkId));
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .clerkId(user.getClerkId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .imageUrl(user.getImageUrl())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                .build();
    }
}
