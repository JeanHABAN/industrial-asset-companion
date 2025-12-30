package com.awc.industrial_asset_companion.devices_locator.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceUpdateDto {
    private String plantId;
    private String type;
    private String name;
    private String system;
    private String panel;
    private String bucket;
    private String aisle;
    private String navText;
    private String qr;
    private String deviceCode;
    private String areaId;
    private String areaName;   // "Filter Gallery"
    private String areaLevel;  // "L1"// nullable → set/unset
    private List<String> tags; // replace entire list (use tag endpoints below for partial changes)
}