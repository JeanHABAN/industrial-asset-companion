
package com.awc.industrial_asset_companion.alarms;

import com.awc.industrial_asset_companion.alarms.alarmDto.AlarmDetailDto;
import com.awc.industrial_asset_companion.alarms.alarmDto.AlarmDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmRepo repo;
    private final AlarmHelpService help;
    private final AckTokenService ackTokens;

    /** Where to send users after one-click ack (hash route ok) */
    @Value("${app.frontend.base-url:http://localhost:5173}")
    String frontendBase;

    private Pageable withDefaultSort(Pageable pageable) {
        return pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "raisedAt"))
                : pageable;
    }

    @GetMapping
    public Page<AlarmDto> list(
            @RequestParam(required = false) UUID stationId,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        final Pageable p = withDefaultSort(pageable);
        final String normQ = (q != null && !q.isBlank()) ? q.trim() : null;
        final String normSev = (severity != null && !severity.isBlank()) ? severity.trim() : null;

        Page<Alarm> page;
        if (StringUtils.hasText(normQ)) {
            page = repo.search(normQ, p);
        } else if (stationId != null) {
            page = repo.findByStationIdOrderByRaisedAtDesc(stationId, p);
        } else if (StringUtils.hasText(normSev)) {
            page = repo.findBySeverityOrderByRaisedAtDesc(normSev, p);
        } else {
            page = repo.findAll(p);
        }
        return page.map(a -> AlarmDto.from(a, null, null)); // now includes state + station info
    }

    @GetMapping("/{id}")
    public AlarmDetailDto getOne(@PathVariable UUID id) {
        var alarm = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alarm not found"));
        var tips = help.tipsFor(alarm);
        return AlarmDetailDto.from(alarm, tips);
    }

    /** In-app ack (idempotent) */
    @PostMapping("/{id}/ack")
    public AlarmDto acknowledge(@PathVariable UUID id, @RequestParam(name = "user", required = false) String user) {
        var alarm = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alarm not found"));

        if (alarm.getAcknowledgedAt() == null) {
            alarm.setAcknowledgedAt(Instant.now());
            alarm.setAcknowledgedBy((user == null || user.isBlank()) ? "operator" : user.trim());
            alarm = repo.save(alarm);
        }
        return AlarmDto.from(alarm, null, null);
    }

    /* ---------------- ONE-CLICK ACK LINKS ---------------- */

    /**
     * Issue a single-use ack token for an alarm.
     * Returns a JSON with { token, expiresAt, ackUrl } so you can drop into email/SMS.
     */
    @PostMapping("/{id}/ack-token")
    public Map<String, Object> issueAckToken(@PathVariable UUID id,
                                             @RequestParam(name = "sentTo", required = false) String sentTo,
                                             @RequestParam(name = "ttlMinutes", required = false, defaultValue = "30") long ttlMinutes) {
        // will throw if alarm missing
        repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alarm not found"));

        var tok = ackTokens.issue(id, sentTo, Duration.ofMinutes(ttlMinutes));
        var ackUrl = frontendBase.replaceAll("/+$", "")
                + "/api/alarms/ack?t=" + tok.getToken();

        return Map.of(
                "token", tok.getToken(),
                "expiresAt", tok.getExpiresAt(),
                "ackUrl", ackUrl
        );
    }

    /**
     * Public GET endpoint used by email/SMS links.
     * Consumes the token, acknowledges the alarm, then redirects to the UI.
     */
    @GetMapping("/ack")
    public ResponseEntity<Void> ackByToken(@RequestParam("t") String token) {
        var alarm = ackTokens.consume(token);

        // Redirect to your SPA route (customize as you like)
        var target = frontendBase.replaceAll("/+$", "")
                + "/#/alarms?justAcked=" + alarm.getId();

        return ResponseEntity.status(302)
                .location(URI.create(target))
                .build();
    }

    /* ---------------- DEV ONLY: simulate ---------------- */

    @PostMapping("/simulate")
    public AlarmDto simulate(@RequestParam UUID stationId,
                             @RequestParam(defaultValue = "WARNING") String severity,
                             @RequestParam(defaultValue = "Simulated alarm") String message) {
        var a = new Alarm();
        a.setStationId(stationId);
        a.setSeverity(severity);
        a.setMessage(message);
        a.setRaisedAt(Instant.now());
        a = repo.save(a);
        return AlarmDto.from(a, null, null);
    }


}
