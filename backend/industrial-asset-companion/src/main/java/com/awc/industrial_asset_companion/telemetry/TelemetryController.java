package com.awc.industrial_asset_companion.telemetry;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

//Telemetry (SCADA) stubs + SSE stream
@RestController
@RequestMapping("/api/stations")
public class TelemetryController {
    // in-memory demo emitter registry
    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping("/{id}/telemetry")
    public Map<String, Object> latest(@PathVariable UUID id){

        // TODO: load from DB or SCADA adapter; mocked for now

        return Map.of(
                "ts", Instant.now().toString(),
                "wetWellLevelFt", 11.2,
                "pump1Running", true,
                "pump2Running", false,
                "flowGpm", 320.0
        );
    }

    @GetMapping(value="/{id}/telemetry/stream", produces= MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable UUID id){
        SseEmitter em = new SseEmitter(0L);
        emitters.computeIfAbsent(id, k-> new CopyOnWriteArrayList<>()).add(em);
        em.onCompletion(() -> emitters.getOrDefault(id, List.of()).remove(em));
        em.onTimeout(() -> emitters.getOrDefault(id, List.of()).remove(em));
        return em;
    }

    // Call this from your SCADA adapter to push live updates
    public void push(UUID id, Map<String,Object> payload){
        var list = emitters.getOrDefault(id, List.of());
        for (var em : list) try { em.send(payload); } catch(Exception ignored){}
    }
}
