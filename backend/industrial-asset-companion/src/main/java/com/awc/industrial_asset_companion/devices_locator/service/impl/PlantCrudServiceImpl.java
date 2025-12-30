package com.awc.industrial_asset_companion.devices_locator.service.impl;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.entity.Plant;
import com.awc.industrial_asset_companion.devices_locator.repositories.PlantRepository;
import com.awc.industrial_asset_companion.devices_locator.repositories.DeviceRepository;
import com.awc.industrial_asset_companion.devices_locator.service.PlantCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor
public class PlantCrudServiceImpl implements PlantCrudService {
    private final PlantRepository plantRepo;
    private final DeviceRepository deviceRepo;

    @Override @Transactional
    public Plant create(PlantCreateDto dto) {
        if (plantRepo.existsById(dto.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Plant already exists");
        var p = Plant.builder().id(dto.getId()).name(dto.getName()).isActive(true).build();
        return plantRepo.save(p);
    }

    @Override @Transactional
    public Plant update(String id, PlantUpdateDto dto) {
        var p = plantRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        p.setName(dto.getName());
        return plantRepo.save(p);
    }

    @Override @Transactional
    public void delete(String id) {
        if (!plantRepo.existsById(id)) return;
        if (!deviceRepo.findByPlantId(id).isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plant has devices; move/delete them first");
        plantRepo.deleteById(id);
    }

    @Override public List<Plant> listPlants() { return plantRepo.findAll(); }
    @Override public Plant get(String id) {
        return plantRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}