
package com.awc.industrial_asset_companion.alarms;

import com.awc.industrial_asset_companion.liftstations.LiftStation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

//Notify service (when to send)
@Service
@RequiredArgsConstructor
public class AlarmNotifyService {

    private final MailService mail;

    /** Call this right after you persist a NEW alarm (first ACTIVE) */
    public void onAlarmRaised(LiftStation station, Alarm alarm) {
        var lite = new MailService.LiftStationLite(station.getId(), station.getCode(), station.getName());
        mail.sendAlarmRaised(lite, alarm);
    }

    // Optional: cleared notifications, escalations, etc.
    public void onAlarmCleared(LiftStation station, Alarm alarm) {}
}
