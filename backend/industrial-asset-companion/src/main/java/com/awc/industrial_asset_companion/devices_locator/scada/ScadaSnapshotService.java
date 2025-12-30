package com.awc.industrial_asset_companion.devices_locator.scada;

import com.awc.industrial_asset_companion.devices_locator.entity.Plant;
import com.awc.industrial_asset_companion.devices_locator.service.PlantCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ScadaSnapshotService {

    private final ScadaDataSource dataSource;
    private final PlantCrudService plantService;

    // Sort order used by the app
    private static final List<String> UI_ORDER = List.of(
            "pH","Turbidity","Free Chlor","ORP","DO","Temperature","Conductivity","Flow","Level"
    );

    public Map<String, Object> getSnapshot(String plantId) {
        final String pid = (plantId == null || plantId.isBlank()) ? "ALL" : plantId;
        final String plantName = !"ALL".equals(pid) ? plantNameFromId(pid) : "All Plants";

        List<ScadaDataSource.Reading> readings = dataSource.readSnapshot(pid);

        List<Map<String, Object>> metrics = new ArrayList<>(readings.size());
        for (var r : readings) {
            String qual = QualityRules.quality(r.type(), r.value());
            metrics.add(mapMetric(r, qual));
        }

        // group-friendly sort: by name (using UI order), then by tag
        metrics.sort((a, b) -> {
            String an = (String) a.get("name");
            String bn = (String) b.get("name");
            int ia = UI_ORDER.indexOf(an); if (ia < 0) ia = Integer.MAX_VALUE;
            int ib = UI_ORDER.indexOf(bn); if (ib < 0) ib = Integer.MAX_VALUE;
            if (ia != ib) return ia - ib;
            return ((String)a.get("tag")).compareTo((String)b.get("tag"));
        });

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("plantId", pid);
        res.put("plantName", plantName);
        res.put("timestamp", Instant.now().toString());
        res.put("metrics", metrics);
        return res;
    }

    private String plantNameFromId(String id) {
        try {
            Plant p = plantService.get(id);
            return p.getName();
        } catch (Exception ignored) {
            return "Plant " + id;
        }
    }

    private Map<String, Object> mapMetric(ScadaDataSource.Reading r, String quality) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("tag", r.tag());
        m.put("name", r.type());        // Explore groups by "name"
        m.put("unit", r.unit() == null ? "" : r.unit());
        m.put("value", r.value());
        m.put("quality", quality);      // GOOD | WARN | ALARM | UNKNOWN
        m.put("deviceId", r.tag());     // deep-link target in app
        return m;
    }
}