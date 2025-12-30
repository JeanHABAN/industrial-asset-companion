package com.awc.industrial_asset_companion.alarms.alarmDto;

import com.awc.industrial_asset_companion.alarms.Alarm;
import com.awc.industrial_asset_companion.alarms.AlarmResourceTip;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AlarmDetailDto(UUID id,
                             UUID stationId,
                             String severity,
                             String message,
                             Instant raisedAt,
                             Instant acknowledgedAt,
                             String acknowledgedBy,
                             boolean acknowledged,
                             List<AlarmResourceTip> resources) {
    public static AlarmDetailDto from(Alarm a, List<AlarmResourceTip> tips) {
        return new AlarmDetailDto(
                a.getId(),
                a.getStationId(),
                a.getSeverity(),
                a.getMessage(),
                a.getRaisedAt(),
                a.getAcknowledgedAt(),
                a.getAcknowledgedBy(),
                a.getAcknowledgedAt() != null,  // derived flag
                tips
        );
    }
}
