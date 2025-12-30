package com.awc.industrial_asset_companion.devices_locator.service;

import com.awc.industrial_asset_companion.devices_locator.dto.*;
import com.awc.industrial_asset_companion.devices_locator.dto.DeviceListItemDto;

import java.util.List;

public interface DeviceCrudService {
    DeviceListItemDto create(DeviceCreateDto dto);
    DeviceListItemDto update(String id, DeviceUpdateDto dto);
    void delete(String id);
    DeviceListItemDto get(String id);
    List<DeviceListItemDto> listByPlant(String plantId); // simple list for now
    // tags utilities
    List<String> replaceTags(String id, List<String> tags);
    List<String> addTags(String id, List<String> tagsToAdd);
    List<String> removeTag(String id, String tag);
}