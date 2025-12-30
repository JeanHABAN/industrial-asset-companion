package com.awc.industrial_asset_companion.devices_locator.controller;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.service.DeviceCrudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/devices", "/v1/devices"})
@RequiredArgsConstructor
public class DeviceCrudController {

    // ✅ Interface, not implementation
    private final DeviceCrudService service;

    @GetMapping("/{id}")
    public DeviceListItemDto get(@PathVariable String id) {
        return service.get(id);
    }

    @GetMapping
    public List<DeviceListItemDto> listByPlant(@RequestParam String plantId) {
        return service.listByPlant(plantId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeviceListItemDto create(@Valid @RequestBody DeviceCreateDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public DeviceListItemDto update(@PathVariable String id, @RequestBody DeviceUpdateDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PutMapping("/{id}/tags")
    public List<String> replaceTags(@PathVariable String id, @RequestBody List<String> tags) {
        return service.replaceTags(id, tags);
    }

    @PostMapping("/{id}/tags")
    public List<String> addTags(@PathVariable String id, @RequestBody List<String> tags) {
        return service.addTags(id, tags);
    }

    @DeleteMapping("/{id}/tags/{tag}")
    public List<String> removeTag(@PathVariable String id, @PathVariable String tag) {
        return service.removeTag(id, tag);
    }
}
