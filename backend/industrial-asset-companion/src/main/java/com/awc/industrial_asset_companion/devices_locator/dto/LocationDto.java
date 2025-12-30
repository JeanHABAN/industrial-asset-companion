package com.awc.industrial_asset_companion.devices_locator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationDto {
    // panel-level positioning and directions
    private String panel;
    private String bucket;
    private String aisle;
    private String navText;

    // indoor map anchor
    private String layerId;  // stringified UUID
    private Double x;
    private Double y;
}
