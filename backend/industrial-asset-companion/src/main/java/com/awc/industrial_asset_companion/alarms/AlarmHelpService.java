package com.awc.industrial_asset_companion.alarms;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Very simple, keyword/severity-based recommendations.
 * Replace hardcoded URLs with your intranet docs or Confluence links.
 */
@Service
public class AlarmHelpService {

    public List<AlarmResourceTip> tipsFor(Alarm a) {
        final var tips = new ArrayList<AlarmResourceTip>();
        final var msg = safeLower(a.getMessage());
        final var sev = safeLower(a.getSeverity());

        // 1) High-level water alarms
        if (msg.contains("high level") || msg.contains("wet well high") || msg.contains("hh")) {
            tips.add(new AlarmResourceTip(
                    "Wet Well High Level SOP",
                    "/docs/sops/wetwell-high-level.pdf",
                    "Verify level sensor reading, check pump statuses, confirm valves and inflow rates."
            ));
            tips.add(new AlarmResourceTip(
                    "Pump Auto/Hand/Off Checklist",
                    "/docs/checklists/pump-aho.pdf",
                    "Ensure at least one pump in AUTO, review lead/lag logic, and test manual start."
            ));
        }

        // 2) Communication/telemetry alarms
        if (msg.contains("comms") || msg.contains("telemetry") || msg.contains("scada")) {
            tips.add(new AlarmResourceTip(
                    "RTU/Telemetry Comms Troubleshooting",
                    "/docs/runbooks/rtu-comms.md",
                    "Ping RTU, verify radio/cellular signal, confirm power and antenna connections."
            ));
            tips.add(new AlarmResourceTip(
                    "Ignition Gateway Status",
                    "/scada/ignition/status",
                    "Check tags and device connections for quality changes or disconnects."
            ));
        }

        // 3) Pump faults or overloads
        if (msg.contains("pump") && (msg.contains("fault") || msg.contains("overload") || msg.contains("fail"))) {
            tips.add(new AlarmResourceTip(
                    "Pump Motor Protection Guide",
                    "/docs/guides/pump-motor-protection.pdf",
                    "Inspect overload relays, MCC breaker status, and thermal conditions."
            ));
        }

        // 4) Severity-based generic tips
        if (sev.contains("critical")) {
            tips.add(new AlarmResourceTip(
                    "Escalation Policy (Critical)",
                    "/docs/policy/escalation-critical.pdf",
                    "Immediately notify on-call supervisor and initiate emergency response if required."
            ));
        } else if (sev.contains("warning")) {
            tips.add(new AlarmResourceTip(
                    "Alarm Response – Warning",
                    "/docs/policy/escalation-warning.pdf",
                    "Acknowledge and schedule follow-up; verify trend deviations over last 2 hours."
            ));
        }

        // Fallback: always include a general triage guide
        if (tips.isEmpty()) {
            tips.add(new AlarmResourceTip(
                    "General Alarm Triage",
                    "/docs/runbooks/alarm-triage.pdf",
                    "Confirm sensor validity, check recent changes, review event history and trends."
            ));
        }

        return tips;
    }

    private static String safeLower(String s) {
        return s == null ? "" : s.toLowerCase();
    }
}
