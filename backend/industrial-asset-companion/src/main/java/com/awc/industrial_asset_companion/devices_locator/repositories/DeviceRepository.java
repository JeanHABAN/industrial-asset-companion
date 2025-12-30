package com.awc.industrial_asset_companion.devices_locator.repositories;

import com.awc.industrial_asset_companion.devices_locator.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, String> {
    List<Device> findByPlantId(String plantId);

    @Query("""
           select d
           from Device d
           left join fetch d.area a
           where d.plantId = :plantId
           """)
    List<Device> findByPlantIdFetchArea(@Param("plantId") String plantId);
}
