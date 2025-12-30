package com.awc.industrial_asset_companion.liftstations.controller;

import com.awc.industrial_asset_companion.alarms.AlarmRepo;
import com.awc.industrial_asset_companion.alarms.alarmDto.PublicAlarmDto;
import com.awc.industrial_asset_companion.liftstations.LiftStationRepo;
import com.awc.industrial_asset_companion.liftstations.dto.LiftStationPublicDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class LiftStationPublicController {
    private final LiftStationRepo stations;
    private final AlarmRepo alarms;

    /** Public, read-only station; include recent safe alarms. */
    @GetMapping("/{id}/public")
    public LiftStationPublicDto getPublic(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean includeAlarms,
            @RequestParam(defaultValue = "10") int alarmLimit
    ) {
        var s = stations.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found"));

        List<PublicAlarmDto> alarmDtos = List.of();
        if (includeAlarms) {
            int limit = Math.max(1, Math.min(alarmLimit, 50));
            alarmDtos = alarms
                    .findByStationIdOrderByRaisedAtDesc(id, PageRequest.of(0, limit))
                    .map(PublicAlarmDto::from)
                    .getContent();
        }
        return LiftStationPublicDto.from(s, alarmDtos);
    }
}
