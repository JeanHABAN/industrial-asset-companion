package com.awc.industrial_asset_companion.liftstations.controller;

import com.awc.industrial_asset_companion.liftstations.LiftStation;
import com.awc.industrial_asset_companion.liftstations.LiftStationRepo;
import com.awc.industrial_asset_companion.liftstations.MapLinks;
import com.awc.industrial_asset_companion.liftstations.dto.LiftStationDtos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.awt.image.BufferedImage;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


//GET http://localhost:8080/api/stations → returns list with googleMaps, googleDirections, etc.
//
//GET http://localhost:8080/api/stations/{id} → single item.
//
//GET http://localhost:8080/api/stations/{id}/qrcode → PNG QR.
// POST http://localhost:8080/api/stations
@RestController
@RequestMapping("/api/stations")
public class LiftStationController {
    private final LiftStationRepo repo;
    public LiftStationController(LiftStationRepo repo){ this.repo = repo; }

    private LiftStationDtos.LiftStationViewDto viewOf(LiftStation ls){
        return new LiftStationDtos.LiftStationViewDto(
                ls.getId(), ls.getCode(), ls.getName(),
                ls.getAddressLine1(), ls.getCity(), ls.getState(), ls.getZip(),
                ls.getLatitude(), ls.getLongitude(),
                ls.getServiceArea(), ls.getWetWellDepthFt(),
                ls.getPumpsCount(), ls.getCommsType(),
                ls.getNotes(),

                // names must match DTO fields above
                MapLinks.googleMaps(ls.getLatitude(), ls.getLongitude()),
                MapLinks.googleDirections(ls.getLatitude(), ls.getLongitude()),
                MapLinks.appleMapsAppPin(ls.getLatitude(), ls.getLongitude(), ls.getName()),
                MapLinks.appleMapsAppDirections(ls.getLatitude(), ls.getLongitude(), ls.getName()),
                MapLinks.androidGeo(ls.getLatitude(), ls.getLongitude(), ls.getName())
        );
    }

//    @GetMapping
//    public java.util.List<LiftStationDtos.LiftStationViewDto> list(@RequestParam(required=false) String q){
//        var list = (q==null || q.isBlank()) ? repo.findAll() : repo.findByNameContainingIgnoreCase(q);
//        return list.stream().map(this::viewOf).toList();
//    }

    @GetMapping
    public Page<LiftStationDtos.LiftStationSummaryDto> list(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) Double minLng,
            @RequestParam(required=false) Double minLat,
            @RequestParam(required=false) Double maxLng,
            @RequestParam(required=false) Double maxLat,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="50") int size) {

        Pageable pageable = PageRequest.of(Math.max(page,0), Math.min(size, 500));

        Page<LiftStation> pg;
        if (minLng!=null && minLat!=null && maxLng!=null && maxLat!=null) {
            pg = repo.findInBbox(minLng, minLat, maxLng, maxLat, pageable);
        } else if (q!=null && !q.isBlank()) {
            pg = repo.findByNameContainingIgnoreCase(q, pageable);
        } else {
            pg = repo.findAll(pageable);
        }

        return pg.map(ls -> new LiftStationDtos.LiftStationSummaryDto(
                ls.getId(), ls.getCode(), ls.getName(),
                ls.getLatitude(), ls.getLongitude(), ls.getPumpsCount(), ls.getCommsType()));
    }

    @GetMapping("/{id}")
    public LiftStationDtos.LiftStationViewDto get(@PathVariable java.util.UUID id){
        return repo.findById(id).map(this::viewOf).orElseThrow();
    }

  /*  @GetMapping
    public List<LiftStationDtos.LiftStationSummaryDto> list(@RequestParam(required=false) String q){
        var list = (q==null || q.isBlank()) ? repo.findAll() : repo.findByNameContainingIgnoreCase(q);
        return list.stream().map(ls -> new LiftStationDtos.LiftStationSummaryDto(
                ls.getId(), ls.getCode(), ls.getName(), ls.getLatitude(), ls.getLongitude(), ls.getPumpsCount(), ls.getCommsType()
        )).collect(Collectors.toList());
    }*/

//    @GetMapping("/{id}")
//    public LiftStation get(@PathVariable UUID id){ return repo.findById(id).orElseThrow(); }

   /* @PostMapping
    public ResponseEntity<LiftStation> create(@RequestBody LiftStationDtos.LiftStationCreateDto dto){
        var ls = new LiftStation();
        ls.setCode(dto.code()); ls.setName(dto.name());
        ls.setAddressLine1(dto.addressLine1()); ls.setCity(dto.city()); ls.setState(dto.state()); ls.setZip(dto.zip());
        ls.setLatitude(dto.latitude()); ls.setLongitude(dto.longitude());
        ls.setServiceArea(dto.serviceArea()); ls.setWetWellDepthFt(dto.wetWellDepthFt());
        ls.setPumpsCount(dto.pumpsCount()); ls.setCommsType(dto.commsType()); ls.setNotes(dto.notes());
        var saved = repo.save(ls);
        return ResponseEntity.created(URI.create("/api/stations/" + saved.getId())).body(saved);
    }*/

    @PostMapping
    public ResponseEntity<?> create(@RequestBody LiftStationDtos.LiftStationCreateDto dto) {
        if (repo.existsByCode(dto.code())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of(
                            "ts", Instant.now().toString(),
                            "status", HttpStatus.CONFLICT.value(),
                            "error", HttpStatus.CONFLICT.getReasonPhrase(),
                            "message", "Station code already exists",
                            "fieldErrors", Map.of("code", "This code is already in use")
                    )
            );
        }

        var ls = new LiftStation();
        ls.setCode(dto.code());
        ls.setName(dto.name());
        ls.setAddressLine1(dto.addressLine1());
        ls.setCity(dto.city());
        ls.setState(dto.state());
        ls.setZip(dto.zip());
        ls.setLatitude(dto.latitude());
        ls.setLongitude(dto.longitude());
        ls.setServiceArea(dto.serviceArea());
        ls.setWetWellDepthFt(dto.wetWellDepthFt());
        ls.setPumpsCount(dto.pumpsCount());
        ls.setCommsType(dto.commsType());
        ls.setNotes(dto.notes());

        var saved = repo.save(ls);
        return ResponseEntity.created(URI.create("/api/stations/" + saved.getId()))
                .body(saved);
    }
    /*@PutMapping("/{id}")
    public LiftStation update(@PathVariable UUID id, @RequestBody LiftStationDtos.LiftStationCreateDto dto){
        var ls = repo.findById(id).orElseThrow();
        ls.setName(dto.name()); ls.setAddressLine1(dto.addressLine1()); ls.setCity(dto.city());
        ls.setState(dto.state()); ls.setZip(dto.zip());
        ls.setLatitude(dto.latitude()); ls.setLongitude(dto.longitude());
        ls.setServiceArea(dto.serviceArea()); ls.setWetWellDepthFt(dto.wetWellDepthFt());
        ls.setPumpsCount(dto.pumpsCount()); ls.setCommsType(dto.commsType()); ls.setNotes(dto.notes());
        return repo.save(ls);
    }*/

    @PutMapping("/{id}")
    public LiftStation update(@PathVariable UUID id, @RequestBody LiftStationDtos.LiftStationCreateDto dto) {
        var ls = repo.findById(id).orElseThrow();
        ls.setName(dto.name());
        ls.setAddressLine1(dto.addressLine1());
        ls.setCity(dto.city());
        ls.setState(dto.state());
        ls.setZip(dto.zip());
        ls.setLatitude(dto.latitude());
        ls.setLongitude(dto.longitude());
        ls.setServiceArea(dto.serviceArea());
        ls.setWetWellDepthFt(dto.wetWellDepthFt());
        ls.setPumpsCount(dto.pumpsCount());
        ls.setCommsType(dto.commsType());
        ls.setNotes(dto.notes());
        return repo.save(ls);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id){
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- SUMMARY ENDPOINTS ---

//    List: GET http://localhost:8080/api/stations/summary
//
//    Filter by name: GET http://localhost:8080/api/stations/summary?q=Riverside
//
//    One item: GET http://localhost:8080/api/stations/{UUID}/summary

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public Page<LiftStationDtos.LiftStationSummaryDto> listSummary(@RequestParam(required = false) String q,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "50") int size) {

        Pageable p = PageRequest.of(Math.max(0, page), Math.min(500, size));

        Page<LiftStation> src = (q == null || q.isBlank())
                ? repo.findAll(p)
                : repo.findByNameContainingIgnoreCase(q, p);

        return src.map(ls -> new LiftStationDtos.LiftStationSummaryDto(
                ls.getId(), ls.getCode(), ls.getName(),
                ls.getLatitude(), ls.getLongitude(),
                ls.getPumpsCount(), ls.getCommsType()
        ));
    }

    @GetMapping("/{id}/summary")
    public com.awc.industrial_asset_companion.liftstations.dto.LiftStationDtos.LiftStationSummaryDto
    getSummary(@PathVariable java.util.UUID id) {
        var ls = repo.findById(id).orElseThrow();
        return new com.awc.industrial_asset_companion.liftstations.dto.LiftStationDtos.LiftStationSummaryDto(
                ls.getId(), ls.getCode(), ls.getName(),
                ls.getLatitude(), ls.getLongitude(),
                ls.getPumpsCount(), ls.getCommsType());
    }
}
