package com.awc.industrial_asset_companion.devices_locator.scada;


import java.time.Instant;
import java.util.List;

public interface ScadaDataSource {

    record Reading(
            String tag,           // e.g. "PH-101"
            String type,          // e.g. "pH", "Turbidity", "Free Chlor", "Flow", "Temperature"
            String unit,          // "", "NTU", "mg/L", etc.
            Double value,         // null if bad/unknown
            Instant timestamp,    // sample time
            String plantId        // which plant produced this reading
    ) {}

    /**
     * Return the current readings for the given plant.
     * If plantId == "ALL" or null/blank, return a union of all plants you serve.
     */
    List<Reading> readSnapshot(String plantId);

}