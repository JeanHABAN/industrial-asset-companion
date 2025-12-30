package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "plant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plant {
    @Id
    private String id;                 // e.g., "ULL"
    @Column(nullable=false) private String name;
    private String kind;                   // Water / Wastewater / LiftStation
    @Column(name="is_active") private Boolean isActive;
}
