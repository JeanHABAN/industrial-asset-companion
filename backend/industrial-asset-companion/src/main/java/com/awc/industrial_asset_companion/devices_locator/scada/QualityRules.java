package com.awc.industrial_asset_companion.devices_locator.scada;

import java.util.Map;

public class QualityRules {

    public record Range(double nomLow, double nomHigh, double alarmLow, double alarmHigh) {}

    // Tune per your SOP. Key must match `type` coming from data source.
    private static final Map<String, Range> RULES = Map.of(
            "pH",          new Range(6.5, 8.5, 6.3, 8.7),
            "Turbidity",   new Range(0.00,0.30, 0.30,0.50),
            "Free Chlor",  new Range(1.50,3.00, 1.20,3.50),
            "Temperature", new Range(18.0,28.0, 15.0,32.0),
            "Flow",        new Range(8.0,16.0,  6.0,20.0)
    );

    public static String quality(String type, Double v) {
        if (v == null) return "UNKNOWN";
        Range r = RULES.get(type);
        if (r == null) return "GOOD"; // default permissive
        if (v < r.alarmLow || v > r.alarmHigh) return "ALARM";
        if (v < r.nomLow   || v > r.nomHigh)   return "WARN";
        return "GOOD";
    }
}