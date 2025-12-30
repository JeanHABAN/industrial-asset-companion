package com.awc.industrial_asset_companion.alarms.alarmDto;

import com.awc.industrial_asset_companion.alarms.Alarm;

import java.time.Instant;
import java.util.UUID;

public record PublicAlarmDto(
        UUID id,
        String severity,
        String message,
        Instant raisedAt,
        boolean acknowledged,
        Instant acknowledgedAt
) {
    public static PublicAlarmDto from(Alarm a) {
        return new PublicAlarmDto(
                a.getId(),
                a.getSeverity(),
                a.getMessage(),
                a.getRaisedAt(),
                a.getAcknowledgedAt() != null,
                a.getAcknowledgedAt()
        );
    }
}
