package com.awc.industrial_asset_companion.devices_locator.scada;

import com.awc.industrial_asset_companion.devices_locator.entity.Plant;
import com.awc.industrial_asset_companion.devices_locator.service.PlantCrudService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@Profile({"dev","mock"})
@RequiredArgsConstructor
public class MockScadaDataSource implements ScadaDataSource {

    private final PlantCrudService plantService; // <- use your real plants to normalize

    @Override
    public List<Reading> readSnapshot(String plantId) {
        final String raw = (plantId == null || plantId.isBlank()) ? "ALL" : plantId;
        final String canon = canonicalPlantId(raw);

        log.info("MockScadaDataSource.readSnapshot raw='{}' canon='{}'", raw, canon);

        Instant now = Instant.now();
        List<Reading> out = new ArrayList<>();

        // ULLRICH sample
        if ("ALL".equals(canon) || "ULLRICH".equals(canon)) {
            out.add(new Reading("PH-101","pH","",             drift(7.2, 0.05),  now, "ULLRICH"));
            out.add(new Reading("PH-102","pH","",             drift(7.1, 0.05),  now, "ULLRICH"));
            out.add(new Reading("TUR-201","Turbidity","NTU",  drift(0.10, 0.05), now, "ULLRICH"));
            out.add(new Reading("CL2-301","Free Chlor","mg/L",drift(2.0, 0.20),  now, "ULLRICH"));
            out.add(new Reading("FLOW-701","Flow","MGD",      drift(11.0, 1.2),  now, "ULLRICH"));
            out.add(new Reading("TEMP-001","Temperature","°C",drift(23.0, 1.0),  now, "ULLRICH"));
        }

        // DAVIS sample
        if ("ALL".equals(canon) || "DAVIS".equals(canon)) {
            out.add(new Reading("PH-501","pH","",             drift(7.3, 0.05),  now, "DAVIS"));
            out.add(new Reading("TUR-501","Turbidity","NTU",  drift(0.08, 0.05), now, "DAVIS"));
            out.add(new Reading("CL2-501","Free Chlor","mg/L",drift(1.7, 0.25),  now, "DAVIS"));
            out.add(new Reading("FLOW-501","Flow","MGD",      drift(9.5, 1.0),   now, "DAVIS"));
            out.add(new Reading("TEMP-501","Temperature","°C",drift(22.0, 1.2),  now, "DAVIS"));
        }

        log.info("MockScadaDataSource -> {} readings", out.size());
        return out;
    }

    /** Normalize whatever the UI sends to a code this mock understands. */
    private String canonicalPlantId(String input) {
        if (input == null) return "ALL";
        String u = input.toUpperCase(Locale.ROOT);
        if ("ALL".equals(u)) return "ALL";

        // 1) Try DB lookup first (handles UUIDs / custom IDs)
        try {
            Plant p = plantService.get(input); // will succeed if 'input' is the DB id
            if (p != null && p.getName() != null) {
                String name = p.getName().toUpperCase(Locale.ROOT);
                if (name.contains("ULLRICH")) return "ULLRICH";
                if (name.contains("DAVIS"))   return "DAVIS";
            }
        } catch (Exception ignore) {
            // not a direct DB id; fall through to heuristics
        }

        // 2) Heuristic on the string itself (works for names or codes sent directly)
        if (u.contains("ULLRICH")) return "ULLRICH";   // handles "ULLRICH", "ULLRICH_WTP", etc.
        if (u.contains("DAVIS"))   return "DAVIS";

        return u; // unknown -> returns empty set (by design)
    }

    private Double drift(double center, double amp) {
        double t = (System.currentTimeMillis() / 1000.0);
        double wiggle = Math.sin(t / 7.0 + center) * amp;
        return Math.round((center + wiggle) * 1000.0) / 1000.0;
    }
}
