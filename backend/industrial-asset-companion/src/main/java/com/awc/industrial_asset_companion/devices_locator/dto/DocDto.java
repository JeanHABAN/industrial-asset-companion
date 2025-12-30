package com.awc.industrial_asset_companion.devices_locator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocDto {
    private String id;
    private String kind;
    private String title;
}
