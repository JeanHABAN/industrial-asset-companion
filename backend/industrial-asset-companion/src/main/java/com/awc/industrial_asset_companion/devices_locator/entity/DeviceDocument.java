package com.awc.industrial_asset_companion.devices_locator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="device_document")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(DeviceDocumentKey.class)
public class DeviceDocument {
    @Id
    @Column(name="device_id") private String deviceId;
    @Id @Column(name="document_id") private java.util.UUID documentId;
}
