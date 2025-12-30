package com.awc.industrial_asset_companion.devices_locator.service;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.entity.Plant;

import java.util.List;

public interface PlantCrudService {
    Plant create(PlantCreateDto dto);
    Plant update(String id, PlantUpdateDto dto);
    void delete(String id);          // will fail if devices still reference the plant
    List<Plant> listPlants();
    Plant get(String id);
}