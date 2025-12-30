package com.awc.industrial_asset_companion.devices_locator.repositories;

import com.awc.industrial_asset_companion.devices_locator.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AreaRepository extends JpaRepository<Area, UUID> {
}

