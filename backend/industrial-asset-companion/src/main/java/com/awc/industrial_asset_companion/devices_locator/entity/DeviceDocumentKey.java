package com.awc.industrial_asset_companion.devices_locator.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDocumentKey {
    private String deviceId;
    private UUID documentId;
}
