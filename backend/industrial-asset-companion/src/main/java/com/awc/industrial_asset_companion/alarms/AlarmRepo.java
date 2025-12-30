package com.awc.industrial_asset_companion.alarms;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AlarmRepo extends JpaRepository <Alarm, UUID>{
    Page<Alarm> findByStationIdOrderByRaisedAtDesc(UUID stationId, Pageable p);
    Page<Alarm> findBySeverityOrderByRaisedAtDesc(String severity, Pageable p);
    @Query("""
           select a from Alarm a
           where (:q is null or :q = '' 
                 or lower(a.message)  like lower(concat('%', :q, '%'))
                 or lower(a.severity) like lower(concat('%', :q, '%')))
           """)
    Page<Alarm> search(@Param("q") String q, Pageable p);
}
