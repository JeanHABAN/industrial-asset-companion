
package com.awc.industrial_asset_companion.alarms;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AckTokenRepo extends JpaRepository<AckToken, UUID> {
    Optional<AckToken> findByTokenAndUsedAtIsNullAndExpiresAtAfter(String token, Instant now);
}
