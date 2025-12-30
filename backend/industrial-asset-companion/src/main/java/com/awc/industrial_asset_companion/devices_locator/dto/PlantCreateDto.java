package com.awc.industrial_asset_companion.devices_locator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PlantCreateDto {
    @NotBlank private String id;   // e.g., "ULL"
    @NotBlank private String name; // "Ullrich WTP"
}