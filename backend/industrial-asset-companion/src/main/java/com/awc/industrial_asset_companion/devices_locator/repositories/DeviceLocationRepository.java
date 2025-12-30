package com.awc.industrial_asset_companion.devices_locator.repositories;

import com.awc.industrial_asset_companion.devices_locator.entity.DeviceLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceLocationRepository extends JpaRepository<DeviceLocation, String> {
    Optional < DeviceLocation> findFirstByDeviceId(String deviceId);
}