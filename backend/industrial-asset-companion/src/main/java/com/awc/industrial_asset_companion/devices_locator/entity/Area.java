package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "area")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(name="plant_id", nullable=false) private String plantId;
    @Column(nullable=false) private String name;        // "Filter Gallery"
    @Column(name="level_label") private String level; // "L1"
}
