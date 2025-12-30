package com.awc.industrial_asset_companion.liftstations;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiftStationRepo extends JpaRepository<LiftStation, UUID> {
//    Optional<LiftStation> findByCode(String code);
//    List<LiftStation> findByNameContainingIgnoreCase(String q);
      boolean existsByCode(String code);

    Page<LiftStation> findByNameContainingIgnoreCase(String q, Pageable pageable);

    @Query(value = """
      SELECT * FROM lift_station ls
      WHERE ST_Within(ls.location, ST_SRID(ST_PolygonFromText(
        CONCAT('POLYGON((',
          :minLng,' ',:minLat,',',
          :maxLng,' ',:minLat,',',
          :maxLng,' ',:maxLat,',',
          :minLng,' ',:maxLat,',',
          :minLng,' ',:minLat,'))')),4326))
      """,
            countQuery = """
      SELECT count(*) FROM lift_station ls
      WHERE ST_Within(ls.location, ST_SRID(ST_PolygonFromText(
        CONCAT('POLYGON((',
          :minLng,' ',:minLat,',',
          :maxLng,' ',:minLat,',',
          :maxLng,' ',:maxLat,',',
          :minLng,' ',:maxLat,',',
          :minLng,' ',:minLat,'))')),4326))
      """,
            nativeQuery = true)
    Page<LiftStation> findInBbox(@Param("minLng") double minLng, @Param("minLat") double minLat,
                                 @Param("maxLng") double maxLng, @Param("maxLat") double maxLat,
                                 Pageable pageable);
}
