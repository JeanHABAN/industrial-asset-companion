package com.awc.industrial_asset_companion.alarms;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="alarm")
public class Alarm {

    @Id
    @GeneratedValue
    private UUID id;
    @Setter
    private UUID stationId;
    @Setter
    private String severity; // CRITICAL/WARNING/INFO
    @Setter
    private String message;
    @Setter
    private Instant raisedAt;

    public Instant getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public UUID getStationId() {
        return stationId;
    }

    public String getSeverity() {
        return severity;
    }

    public String getMessage() {
        return message;
    }

    public Instant getRaisedAt() {
        return raisedAt;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    @Setter
    private Instant acknowledgedAt;
    @Setter
    private String acknowledgedBy;

    public UUID getId() {
        return id;
    }

    @JsonProperty("acknowledged")
    public boolean isAcknowledged() {
        return getAcknowledgedAt() != null;
    }
}
