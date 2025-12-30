package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name="document")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue
    private UUID id;
    private String title;                 // "Filters P&ID page 1"
    private String kind;                  // "PID", "Datasheet", "Photo"
    @Column(name="blob_key") private String blobKey;
    private String mime;
}
