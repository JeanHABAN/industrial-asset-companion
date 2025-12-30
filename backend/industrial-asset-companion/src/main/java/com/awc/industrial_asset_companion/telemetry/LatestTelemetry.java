package com.awc.industrial_asset_companion.telemetry;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="latest_telemetry")
public class LatestTelemetry {
    @Id
    private UUID stationId;
    private Double wetWellLevelFt;
    private Boolean pump1Running;
    private Boolean pump2Running;
    private Double flowGpm;
    private Instant ts;
}
