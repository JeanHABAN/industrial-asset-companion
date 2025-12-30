package com.awc.industrial_asset_companion.alarms;

import java.util.List;

public record AlarmWithTips (Alarm alarm,
                             List<AlarmResourceTip> tips) {
}
