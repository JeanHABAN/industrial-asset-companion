package com.awc.industrial_asset_companion.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//CORS (so the web app can call the API)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000","http://localhost:5173","http://localhost:8080", "http://localhost:19006", "http://localhost:8081")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS");

    }
}
