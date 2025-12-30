package com.awc.industrial_asset_companion.liftstations;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public final class MapLinks {
    private MapLinks() {}

    // Always emit dot-decimals with ~0.1m precision
    private static String fmt(double v) {
        return String.format(Locale.US, "%.6f", v);
    }

    /* ---------- Google Maps ---------- */

    /** Google Maps search pin at exact coordinates (works on web & Android) */
    public static String googleMaps(double lat, double lng) {
        return "https://www.google.com/maps/search/?api=1&query=" + fmt(lat) + "," + fmt(lng);
    }

    /** Google Maps directions to exact coordinates */
    public static String googleDirections(double lat, double lng) {
        return "https://www.google.com/maps/dir/?api=1&destination=" + fmt(lat) + "," + fmt(lng);
    }

    /* ---------- Apple Maps ---------- */

    /** Apple Maps (iOS app) pin at exact coordinates — good for Safari/iOS */
    public static String appleMapsAppPin(double lat, double lng, String name) {
        String encName = URLEncoder.encode(name == null ? "" : name, StandardCharsets.UTF_8);
        return "maps://?q=" + encName + "&ll=" + fmt(lat) + "," + fmt(lng);
    }

    /** Apple Maps (iOS app) directions to coordinates */
    public static String appleMapsAppDirections(double lat, double lng, String name) {
        String encName = URLEncoder.encode(name == null ? "" : name, StandardCharsets.UTF_8);
        return "maps://?daddr=" + fmt(lat) + "," + fmt(lng) + "&q=" + encName;
    }

    /* ---------- Android geo: URI ---------- */

    /** Android geo URI (great offline if maps area is downloaded) */
    public static String androidGeo(double lat, double lng, String label) {
        String encLabel = URLEncoder.encode(label == null ? "" : label, StandardCharsets.UTF_8);
        return "geo:" + fmt(lat) + "," + fmt(lng) + "?q=" + fmt(lat) + "," + fmt(lng) + "(" + encLabel + ")";
    }
}
