package com.awc.industrial_asset_companion.devices_locator.controller;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.entity.Plant;
import com.awc.industrial_asset_companion.devices_locator.service.PlantCrudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping({"/api/plants", "/v1/plants"})
@RequiredArgsConstructor
public class PlantCrudController {

    private final PlantCrudService service;

    @GetMapping
    public List<Plant> list() {
        return service.listPlants().stream()
                .sorted(Comparator.comparing(Plant::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
    @GetMapping("/{id}") public Plant get(@PathVariable String id) { return service.get(id); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Plant create(@Valid @RequestBody PlantCreateDto dto) { return service.create(dto); }

    @PutMapping("/{id}")
    public Plant update(@PathVariable String id, @Valid @RequestBody PlantUpdateDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) { service.delete(id); }

    @GetMapping("/options")
    public List<PlantOptionDto> options(@RequestParam(required = false) String q) {
        return service.listPlants().stream()
                .filter(p -> q == null || q.isBlank()
                        || p.getName().toLowerCase().contains(q.toLowerCase())
                        || p.getId().toLowerCase().contains(q.toLowerCase()))
                .map(p -> new PlantOptionDto(p.getId(), p.getName()))
                .toList();
    }
}