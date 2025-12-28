package com.example.flightservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "aviationstack")
public class AviationStackConfig {
    private String apiKey;
    private String baseUrl = "http://api.aviationstack.com/v1";
}