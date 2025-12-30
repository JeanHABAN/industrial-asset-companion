// src/main/java/com/awc/industrial_asset_companion/alarms/MailService.java
package com.awc.industrial_asset_companion.alarms;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

//Mail service (builds message + includes one-click ack URL)
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailer;
    private final AckTokenService tokens;
    private final OperatorRoster roster;

    @Value("${app.mail.from:alarms@localhost}")
    String from;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    String frontendBase;

    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z").withZone(ZoneId.systemDefault());

    /** Send alarm "raised" emails with unique one-click ACK links */
    public void sendAlarmRaised(LiftStationLite station, Alarm alarm) {
        for (var r : roster.recipientsFor(station.id(), alarm.getSeverity())) {
            var tok = tokens.issue(alarm.getId(), r.email(), Duration.ofMinutes(30));
            var ackUrl = frontendBase.replaceAll("/+$", "") + "/api/alarms/ack?t=" + tok.getToken();

            var subject = "[" + (alarm.getSeverity()==null?"ALARM":alarm.getSeverity()) + "] " + (station.name()==null?"Station":station.name());
            var body = """
          Alarm: %s
          Severity: %s
          Station: %s (%s)
          Raised At: %s

          Acknowledge receipt:
          %s

          View in app:
          %s/#/alarms
          """.formatted(
                    safe(alarm.getMessage()),
                    safe(alarm.getSeverity()),
                    safe(station.name()), station.code(),
                    TS.format(alarm.getRaisedAt()==null?java.time.Instant.now():alarm.getRaisedAt()),
                    ackUrl,
                    frontendBase.replaceAll("/+$","")
            );

            var mail = new SimpleMailMessage();
            mail.setFrom(from);
            mail.setTo(r.email());
            mail.setSubject(subject);
            mail.setText(body);
            mailer.send(mail);
        }
    }

    private static String safe(String s) { return s==null ? "—" : s; }

    /** tiny DTO so we don't depend on your full LiftStation entity here */
    public record LiftStationLite(UUID id, String code, String name) {}
}
