package com.example.auth_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncUserRequest {
    private String clerkId;
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
    private String role;
}
