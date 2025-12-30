import React, { useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, ActivityIndicator, FlatList, Platform, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { fetchPlants } from "@/lib/api/plants";
import { fetchScadaSnapshot } from "@/lib/api/scada";
import type { Metric } from "../../types/scada";
import { usePersistedPlant } from "@/lib/state/plant";
import { PlantPicker } from "../../components/scada/PlantPicker";
import { MetricCard } from "../../components/scada/MetricCard";

const POLL_MS = 5000;

// order used for grouping
const ORDER = ["pH", "Turbidity", "Free Chlor", "ORP", "DO", "Temperature", "Conductivity", "Flow", "Level"];

export default function ExploreScreen() {
  const { plantId, plantName, choose, ready } = usePersistedPlant();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [polling, setPolling] = useState(true);
  const refetchRef = useRef<(() => void) | null>(null);

  // plants list for picker
  const plantsQ = useQuery({
    queryKey: ["plants"],
    queryFn: fetchPlants,
    staleTime: 60_000, // 1 min
  });

  // scada snapshot
  const snapshotQ = useQuery({
    queryKey: ["scada", plantId ?? "ALL"],
    queryFn: () => fetchScadaSnapshot(plantId),
    refetchInterval: polling ? POLL_MS : false, // built-in polling
    enabled: ready, // wait until we restore plant selection
  });

  // Expose manual refresh to the button
  refetchRef.current = snapshotQ.refetch;

  const lastUpdated = useMemo(() => {
    const t = snapshotQ.data?.timestamp;
    if (!t) return "—";
    try { return new Date(t).toLocaleTimeString(); } catch { return t; }
  }, [snapshotQ.data?.timestamp]);

  // stable sort: by type name per ORDER, then by tag
  const metrics: Metric[] = useMemo(() => {
    const m = snapshotQ.data?.metrics ?? [];
    return [...m].sort((a, b) => {
      const ia = ORDER.indexOf(a.name); const ib = ORDER.indexOf(b.name);
      const sa = ia === -1 ? 999 : ia; const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb;
      return a.tag.localeCompare(b.tag);
    });
  }, [snapshotQ.data?.metrics]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>SCADA Snapshot</Text>

        <View style={styles.subRow}>
          {/* plant selector */}
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [styles.selector, pressed && { opacity: 0.9 }, webCursor()]}
          >
            <IconSymbol name="building.2.crop.circle" size={16} color="#cfe1ff" />
            <Text style={styles.selectorText}>
              {plantName || snapshotQ.data?.plantName || "All plants"}
            </Text>
            <IconSymbol name="chevron.down" size={14} color="#94a3b8" />
          </Pressable>

          <Text style={styles.sub}>Updated {lastUpdated}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setPolling(p => !p)}
            style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.9 }, webCursor()]}
          >
            <IconSymbol name={polling ? "pause.circle.fill" : "play.circle.fill"} size={18} color="#93c5fd" />
            <Text style={styles.pillText}>{polling ? "Pause" : "Resume"}</Text>
          </Pressable>

          <Pressable
            onPress={() => refetchRef.current?.()}
            style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.9 }, webCursor()]}
          >
            <IconSymbol name="arrow.clockwise.circle.fill" size={18} color="#93c5fd" />
            <Text style={styles.pillText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {/* Body */}
      {snapshotQ.isLoading || !ready ? (
        <View style={{ paddingTop: 24 }}><ActivityIndicator /></View>
      ) : snapshotQ.isError ? (
        <Text style={{ color: "#fecaca", padding: 12 }}>
          Error: {(snapshotQ.error as Error)?.message ?? "Failed to load readings"}
        </Text>
      ) : (
        <FlatList
          data={metrics}
          keyExtractor={(m) => m.tag}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <MetricCard m={item} />}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>
              No metrics.
            </Text>
          }
        />
      )}

      {/* Plant picker modal */}
      <PlantPicker
        visible={pickerOpen}
        plants={plantsQ.data ?? []}
        currentPlantId={plantId}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => {
          setPickerOpen(false);
          // persist choice; if undefined, it's "All plants"
          choose(p?.id, p?.name);
          // optional: immediate refresh for snappier feel
          refetchRef.current?.();
        }}
      />
    </SafeAreaView>
  );
}

function webCursor() {
  return Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {};
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  h1: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" },
  sub: { color: "#94a3b8" },
  headerActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  pillBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0b1220", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "#1f2937",
  },
  pillText: { color: "#cfe1ff", fontWeight: "700" },
  selector: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0b1220", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "#1f2937",
  },
  selectorText: { color: "#cfe1ff", fontWeight: "800" },
});
