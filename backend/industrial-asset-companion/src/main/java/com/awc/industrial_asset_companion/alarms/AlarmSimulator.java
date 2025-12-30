package com.awc.industrial_asset_companion.alarms;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AlarmSimulator {
    private final AlarmRepo repo;

    public AlarmSimulator(AlarmRepo repo) {
        this.repo = repo;
    }

    // Run every 30 seconds
    @Scheduled(fixedRate = 30000)
    public void generateFakeAlarm() {
        Alarm alarm = new Alarm();

        alarm.setStationId(UUID.randomUUID());  // random stationId for now
        alarm.setSeverity("HIGH");
        alarm.setMessage("Pump failure detected");
        alarm.setRaisedAt(Instant.now());
        alarm.setAcknowledgedAt(null);
        alarm.setAcknowledgedBy(null);

        repo.save(alarm);
        System.out.println("🚨 Fake alarm generated: " + alarm.getMessage());
    }
}
