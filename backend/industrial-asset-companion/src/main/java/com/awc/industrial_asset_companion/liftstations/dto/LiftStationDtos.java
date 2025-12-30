package com.awc.industrial_asset_companion.liftstations.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

public final class LiftStationDtos {

    // Create/Update payload (unchanged, include your fields)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static record LiftStationCreateDto(
            String code, String name,
            String addressLine1, String city, String state, String zip,
            Double latitude, Double longitude,
            String serviceArea, Double wetWellDepthFt,
            Integer pumpsCount, String commsType,
            String notes
    ) {}

    // List/Summary row (used by /api/stations and /api/stations/summary)
    public static record LiftStationSummaryDto(
            UUID id, String code, String name,
            Double latitude, Double longitude,
            Integer pumpsCount, String commsType
    ) {}

    // Full view — IMPORTANT: names match StationDetail.tsx
    public static record LiftStationViewDto(
            UUID id, String code, String name,
            String addressLine1, String city, String state, String zip,
            Double latitude, Double longitude,
            String serviceArea, Double wetWellDepthFt,
            Integer pumpsCount, String commsType,
            String notes,

            // Map links (names match the React file)
            String googleMaps,
            String googleDirections,
            String appleMapsPin,          // React reads appleMaps OR appleMapsPin (we send appleMapsPin)
            String appleMapsDirections,
            String androidGeoUri          // React reads androidGeoUri
    ) {}
}
