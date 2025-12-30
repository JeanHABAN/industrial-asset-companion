package com.awc.industrial_asset_companion.liftstations.dto;

import com.awc.industrial_asset_companion.alarms.alarmDto.PublicAlarmDto;
import com.awc.industrial_asset_companion.liftstations.LiftStation;
import com.awc.industrial_asset_companion.liftstations.MapLinks;

import java.util.List;
import java.util.UUID;

public record LiftStationPublicDto(
        UUID id,
        String code,
        String name,
        String address,
        String city,
        String state,
        String zip,
        Double latitude,
        Double longitude,
        String googleMapsUrl,
        String googleDirectionsUrl,
        String appleMapsAppPin,
        String appleMapsDirections,
        String androidGeoUri,
        List<PublicAlarmDto> alarms // optional, safe fields only
) {
    public static LiftStationPublicDto from(LiftStation s, List<PublicAlarmDto> alarms) {
        Double lat = s.getLatitude();
        Double lng = s.getLongitude();
        String name = s.getName();

        return new LiftStationPublicDto(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getAddressLine1(),
                s.getCity(),
                s.getState(),
                s.getZip(),
                lat,
                lng,
                MapLinks.googleMaps(lat, lng),
                MapLinks.googleDirections(lat, lng),
                MapLinks.appleMapsAppPin(lat,lng,name),
                MapLinks.appleMapsAppDirections(lat, lng, name),
                MapLinks.androidGeo(lat, lng, name),
                alarms
        );
    }
}
