package com.awc.industrial_asset_companion.devices_locator.scada;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/scada")
@RequiredArgsConstructor
public class ScadaController {

    private final ScadaSnapshotService snapshotService;

    @GetMapping("/readings")
    public Map<String, Object> getReadings(@RequestParam(required = false) String plantId) {
        return snapshotService.getSnapshot(plantId);
    }
}