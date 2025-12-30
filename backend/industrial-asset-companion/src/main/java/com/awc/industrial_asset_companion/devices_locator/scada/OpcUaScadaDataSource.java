package com.awc.industrial_asset_companion.devices_locator.scada;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("prod")
public class OpcUaScadaDataSource implements ScadaDataSource {
    // inject OPC UA client / connections
    @Override
    public List<Reading> readSnapshot(String plantId) {
        // 1) Resolve tag list for plant (DB or config)
        // 2) Batch-read current values from SCADA
        // 3) Map to Reading(tag, type, unit, value, timestamp, plantId)
        return List.of(); // TODO
    }
}