package com.awc.industrial_asset_companion.devices_locator.scada;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
@Value
@Builder
public class ScadaReadingDto {
    String deviceId;      // e.g. "PH-101"
    String name;          // UI name e.g. "Filter Influent pH"
    String type;          // "PH", "TURB", "CL2" ...
    String unit;          // "", "NTU", "mg/L", "°C", "MGD"
    Double value;         // current value
    String quality;       // "GOOD" | "WARN" | "BAD"
    Instant timestamp;    // when sampled

    // context for the tech
    String plantId;
    String system;        // e.g. "Filters"
    String areaName;      // e.g. "Filter Gallery"
    String areaLevel;     // e.g. "L1"
}
