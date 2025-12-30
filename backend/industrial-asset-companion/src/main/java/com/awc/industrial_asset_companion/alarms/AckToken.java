
package com.awc.industrial_asset_companion.alarms;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alarm_ack_token", indexes = {
        @Index(name = "ix_ack_token", columnList = "token", unique = true),
        @Index(name = "ix_ack_expires", columnList = "expiresAt")
})
@Getter @Setter @NoArgsConstructor
public class AckToken {

    @Id
    @GeneratedValue
    private UUID id;

    /** Which alarm this token acknowledges */
    @Column(nullable = false, columnDefinition = "BINARY(16)")
    private UUID alarmId;

    /** Who we sent this to (email/phone/name) – optional metadata */
    private String sentTo;

    /** Opaque random token (url-safe) */
    @Column(nullable = false, unique = true, length = 120)
    private String token;

    /** When token expires (after which it’s invalid) */
    @Column(nullable = false)
    private Instant expiresAt;

    /** When it was used (null = unused) */
    private Instant usedAt;
}
