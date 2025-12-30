package com.awc.industrial_asset_companion.liftstations.shared;

import jakarta.persistence.PrePersist;

import java.util.UUID;

public class Ids {
    @PrePersist
    public void ensureId(Object entity) {
        try {
            var f = entity.getClass().getDeclaredField("id");
            f.setAccessible(true);
            if (f.get(entity) == null) f.set(entity, UUID.randomUUID());
        } catch (NoSuchFieldException ignored) {
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
