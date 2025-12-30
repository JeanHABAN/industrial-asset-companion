package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity @Table(name = "device_location")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceLocation {
    @Id
    @Column(name="device_id")
    private String deviceId; // FK to device.id (also PK)

    @OneToOne(fetch = FetchType.LAZY) @MapsId
    @JoinColumn(name="device_id")
    @ToString.Exclude
    private Device device;

    @Column(name="layer_id")
    private UUID layerId;    // indoor floor layer id (from floorplan_layer)

    private Double x;        // local coords in layer CRS (e.g., SVG px)
    private Double y;
}
