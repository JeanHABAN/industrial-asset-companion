package com.awc.industrial_asset_companion.devices_locator.service.impl;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.entity.Area;
import com.awc.industrial_asset_companion.devices_locator.entity.Device;
import com.awc.industrial_asset_companion.devices_locator.repositories.AreaRepository;
import com.awc.industrial_asset_companion.devices_locator.repositories.DeviceRepository;
import com.awc.industrial_asset_companion.devices_locator.service.DeviceCrudService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceCrudServiceImpl implements DeviceCrudService {

    private final DeviceRepository deviceRepo;
    private final AreaRepository areaRepo;

    @Override
    @Transactional
    public List<DeviceListItemDto> listByPlant(String plantId) {
        List<Device> devices = deviceRepo.findByPlantIdFetchArea(plantId);

        // force-load tags for each device so Json can’t blow up later
        for (Device d : devices) {
            Hibernate.initialize(d.getTags());
        }

        return devices.stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public DeviceListItemDto get(String id) {
        Device dev = deviceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));

        // force-load tags
        Hibernate.initialize(dev.getTags());

        return toDto(dev);
    }

    @Override
    public DeviceListItemDto create(DeviceCreateDto dto) {
        Device dev = Device.builder()
                .id(dto.getId())
                .plantId(dto.getPlantId())
                .type(ns(dto.getType()))
                .name(ns(dto.getName()))
                .system(ns(dto.getSystem()))
                .panel(ns(dto.getPanel()))
                .bucket(ns(dto.getBucket()))
                .aisle(ns(dto.getAisle()))
                .navText(ns(dto.getNavText()))
                .qrPayload(ns(dto.getQr()))
                .deviceCode(ns(dto.getDeviceCode()))
                .tags(dto.getTags() != null ? new ArrayList<>(dto.getTags()) : new ArrayList<>())
                .build();

        // 🔴 this was throwing
        if (dto.getAreaId() != null && !dto.getAreaId().isBlank()) {
            try {
                var areaUuid = UUID.fromString(dto.getAreaId());
                areaRepo.findById(areaUuid).ifPresent(dev::setArea);
            } catch (IllegalArgumentException ex) {
                // ignore bad area id for now
                dev.setArea(null);
            }
        }

        Device saved = deviceRepo.save(dev);
        Hibernate.initialize(saved.getTags());
        return toDto(saved);
    }

    @Override
    public DeviceListItemDto update(String id, DeviceUpdateDto dto) {
        Device dev = deviceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));

        if (dto.getPlantId() != null) dev.setPlantId(dto.getPlantId());
        if (dto.getType() != null) dev.setType(dto.getType());
        if (dto.getName() != null) dev.setName(dto.getName());
        if (dto.getSystem() != null) dev.setSystem(dto.getSystem());
        if (dto.getPanel() != null) dev.setPanel(dto.getPanel());
        if (dto.getBucket() != null) dev.setBucket(dto.getBucket());
        if (dto.getAisle() != null) dev.setAisle(dto.getAisle());
        if (dto.getNavText() != null) dev.setNavText(dto.getNavText());
        if (dto.getQr() != null) dev.setQrPayload(dto.getQr());
        if (dto.getDeviceCode() != null) dev.setDeviceCode(dto.getDeviceCode());

        // area
        if (dto.getAreaId() != null) {
            if (dto.getAreaId().isBlank()) {
                dev.setArea(null);
            } else {
                try {
                    var areaUuid = UUID.fromString(dto.getAreaId());
                    areaRepo.findById(areaUuid).ifPresent(dev::setArea);
                } catch (IllegalArgumentException ex) {
                    dev.setArea(null);
                }
            }
        }

        Device saved = deviceRepo.save(dev);
        Hibernate.initialize(saved.getTags());
        return toDto(saved);
    }

    @Override
    public void delete(String id) {
        if (deviceRepo.existsById(id)) {
            deviceRepo.deleteById(id);
        }
    }

    @Override
    public List<String> replaceTags(String id, List<String> tags) {
        Device dev = deviceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        dev.setTags(tags != null ? new ArrayList<>(tags) : new ArrayList<>());
        deviceRepo.save(dev);
        Hibernate.initialize(dev.getTags());
        return dev.getTags();
    }

    @Override
    public List<String> addTags(String id, List<String> tagsToAdd) {
        Device dev = deviceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        if (dev.getTags() == null) dev.setTags(new ArrayList<>());
        if (tagsToAdd != null) dev.getTags().addAll(tagsToAdd);
        deviceRepo.save(dev);
        Hibernate.initialize(dev.getTags());
        return dev.getTags();
    }

    @Override
    public List<String> removeTag(String id, String tag) {
        Device dev = deviceRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        if (dev.getTags() != null) {
            dev.getTags().removeIf(t -> t.equalsIgnoreCase(tag));
        }
        deviceRepo.save(dev);
        Hibernate.initialize(dev.getTags());
        return dev.getTags() != null ? dev.getTags() : List.of();
    }

    private DeviceListItemDto toDto(Device dev) {
        AreaDto areaDto = null;
        Area area = dev.getArea();
        if (area != null) {
            areaDto = AreaDto.builder()
                    .id(area.getId() != null ? area.getId().toString() : null)
                    .name(ns(area.getName()))
                    .level(ns(area.getLevel()))
                    .build();
        }

        LocationDto loc = LocationDto.builder()
                .panel(ns(dev.getPanel()))
                .bucket(ns(dev.getBucket()))
                .aisle(ns(dev.getAisle()))
                .navText(ns(dev.getNavText()))
                .build();

        ScanDto scan = ScanDto.builder()
                .qr(ns(dev.getQrPayload()))
                .build();

        return DeviceListItemDto.builder()
                .id(dev.getId())
                .plantId(ns(dev.getPlantId()))
                .type(ns(dev.getType()))
                .name(ns(dev.getName()))
                .system(ns(dev.getSystem()))
                .area(areaDto)
                .loc(loc)
                .scan(scan)
                .docs(Collections.emptyList())
                .tags(dev.getTags() != null ? dev.getTags() : Collections.emptyList())
                .build();
    }

    private static String ns(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
