package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "device")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    private String id;

    @Column(name = "plant_id", nullable = false)
    private String plantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @ToString.Exclude
    private Area area;

    private String type;
    private String name;

    // ✅ rename physical column to avoid MySQL reserved word
    @Column(name = "system_name")
    private String system;

    private String panel;
    private String bucket;
    private String aisle;

    @Column(name = "nav_text")
    private String navText;

    @Column(name = "qr_payload")
    private String qrPayload;

    @Column(name = "device_code")
    private String deviceCode;

    // ✅ MySQL-friendly tags: store as element collection (join table)
    @ElementCollection
    @CollectionTable(
            name = "device_tag",
            joinColumns = @JoinColumn(name = "device_id")
    )
    @Column(name = "tag", length = 128)
    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
