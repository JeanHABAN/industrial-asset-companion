package com.awc.industrial_asset_companion.devices_locator.repositories;

import com.awc.industrial_asset_companion.devices_locator.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    @Query("""
    SELECT d FROM Document d
    WHERE d.id IN (
      SELECT dd.documentId FROM DeviceDocument dd WHERE dd.deviceId = :deviceId
    )
  """)
    List<Document> findByDeviceId(String deviceId);
}
