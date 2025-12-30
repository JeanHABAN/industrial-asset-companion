// src/main/java/com/awc/industrial_asset_companion/alarms/AckTokenService.java
package com.awc.industrial_asset_companion.alarms;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AckTokenService {
    private final AckTokenRepo repo;
    private final AlarmRepo alarmRepo;
    private final SecureRandom rng = new SecureRandom();

    /** Create a single-use token (default TTL 30 minutes) */
    @Transactional
    public AckToken issue(UUID alarmId, String sentTo, Duration ttl) {
        var alarm = alarmRepo.findById(alarmId).orElseThrow();
        var t = new AckToken();
        t.setAlarmId(alarm.getId());
        t.setSentTo(sentTo);
        t.setToken(randomToken());
        t.setExpiresAt(Instant.now().plus(ttl != null ? ttl : Duration.ofMinutes(30)));
        return repo.save(t);
    }

    /** Validate + consume the token. Returns the acknowledged Alarm. */
    @Transactional
    public Alarm consume(String token) {
        var tok = repo.findByTokenAndUsedAtIsNullAndExpiresAtAfter(token, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        var alarm = alarmRepo.findById(tok.getAlarmId()).orElseThrow();

        if (alarm.getAcknowledgedAt() == null) {
            alarm.setAcknowledgedAt(Instant.now());
            var who = (tok.getSentTo() == null || tok.getSentTo().isBlank()) ? "ack-link" : "ack-link:" + tok.getSentTo();
            alarm.setAcknowledgedBy(who);
            alarmRepo.save(alarm);
        }

        tok.setUsedAt(Instant.now());
        repo.save(tok);

        return alarm;
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        rng.nextBytes(bytes);
        // URL-safe base64 (no padding)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
