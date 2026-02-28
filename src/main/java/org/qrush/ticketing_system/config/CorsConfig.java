package org.qrush.ticketing_system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials (for cookies/auth)
        config.setAllowCredentials(true);

        // Explicitly allow all necessary origins
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                "https://q-rush.vercel.app"));

        // Allow all necessary headers
        config.setAllowedHeaders(Arrays.asList(
                "*" // Allow all headers - simpler for development
        ));

        // Allow all necessary methods
        config.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS",
                "PATCH",
                "HEAD"));

        // Set cache time for preflight requests
        config.setMaxAge(3600L);

        // Register CORS for all API endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/", config);

        return new CorsFilter(source);
    }
}