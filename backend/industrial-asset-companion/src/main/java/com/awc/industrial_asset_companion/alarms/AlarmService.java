package com.awc.industrial_asset_companion.alarms;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AlarmService {

    private final AlarmRepo repo;
    private final AlarmHelpService helpService;

    public AlarmService(AlarmRepo repo, AlarmHelpService helpService) {
        this.repo = repo;
        this.helpService = helpService;
    }

    public Alarm get(UUID id) {
        return repo.findById(id).orElseThrow();
    }

    public AlarmWithTips getWithTips(UUID id) {
        Alarm alarm = get(id);
        List<AlarmResourceTip> tips = helpService.tipsFor(alarm);
        return new AlarmWithTips(alarm, tips);
    }

    public Page<Alarm> list(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Page<Alarm> search(String q, Pageable pageable) {
        return repo.search(q, pageable);
    }

    public Alarm acknowledge(UUID id, String username) {
        Alarm alarm = get(id);
        alarm.setAcknowledgedAt(Instant.now());
        alarm.setAcknowledgedBy(username);
        return repo.save(alarm);
    }

    public Alarm simulate(UUID stationId, String severity, String message) {
        Alarm alarm = new Alarm();
        alarm.setStationId(stationId);
        alarm.setSeverity(severity);
        alarm.setMessage(message);
        alarm.setRaisedAt(Instant.now());
        return repo.save(alarm);
    }
}
