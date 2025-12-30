// src/main/java/com/awc/industrial_asset_companion/alarms/OperatorRoster.java
package com.awc.industrial_asset_companion.alarms;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

//who to notify
/** Replace with real roster logic (DB/config) later */
@Service
public class OperatorRoster {
    public List<OperatorRecipient> recipientsFor(UUID stationId, String severity) {
        // Demo: send everything to a single mailbox for now
        return List.of(new OperatorRecipient("operator@example.com", "On-call Operator"));
    }
}
