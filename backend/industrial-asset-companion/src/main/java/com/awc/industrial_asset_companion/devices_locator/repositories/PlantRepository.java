package com.awc.industrial_asset_companion.devices_locator.repositories;

import com.awc.industrial_asset_companion.devices_locator.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantRepository extends JpaRepository<Plant, String> { }