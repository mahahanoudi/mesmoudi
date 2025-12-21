package com.example.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String clerkId;
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
    private String role;
    private Boolean active;
    private String createdAt;
    private String updatedAt;
}
