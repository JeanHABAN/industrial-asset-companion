package com.awc.industrial_asset_companion.devices_locator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceListItemDto {
    private String id;
    private String plantId;      // used by .plantId(...)
    private String type;
    private String name;
    private String system;

    // 👇 these drive builder methods .area(...), .loc(...), .scan(...), .docs(...), .tags(...)
    private AreaDto area;
    private LocationDto loc;
    private ScanDto scan;

    @Builder.Default
    private List<DocDto> docs = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
