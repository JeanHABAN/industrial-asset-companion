package com.awc.industrial_asset_companion.alarms.alarmDto;

import com.awc.industrial_asset_companion.alarms.Alarm;

import java.time.Instant;
import java.util.UUID;

public record AlarmDto(
        UUID id,
        UUID stationId,
        String stationCode,
        String stationName,
        String severity,
        String message,         // Alarm description
        Instant raisedAt,       // When the alarm was opened
        Instant acknowledgedAt,
        String acknowledgedBy,
        boolean acknowledged,
        String state            // Derived: OPEN / ACKNOWLEDGED
) {
    public static AlarmDto from(Alarm a, String stationCode, String stationName) {
        return new AlarmDto(
                a.getId(),
                a.getStationId(),
                stationCode,
                stationName,
                a.getSeverity(),
                a.getMessage(),
                a.getRaisedAt(),
                a.getAcknowledgedAt(),
                a.getAcknowledgedBy(),
                a.getAcknowledgedAt() != null,
                a.getAcknowledgedAt() != null ? "ACKNOWLEDGED" : "OPEN"
        );
    }
}
