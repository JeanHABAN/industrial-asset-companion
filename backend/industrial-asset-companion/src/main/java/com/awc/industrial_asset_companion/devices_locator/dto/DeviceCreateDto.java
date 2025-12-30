package com.awc.industrial_asset_companion.devices_locator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceCreateDto {
    @NotBlank private String id;
    @NotBlank private String plantId;

    private String type;
    private String name;
    private String system;   // mapped to column system_name
    private String panel;
    private String bucket;
    private String aisle;
    private String navText;
    private String qr;       // qr_payload
    private String deviceCode;

    private String areaId;   // optional, link to Area by UUID (string)
    private String areaName;   // "Filter Gallery"
    private String areaLevel;  // "L1"
    private List<String> tags; // optional
}