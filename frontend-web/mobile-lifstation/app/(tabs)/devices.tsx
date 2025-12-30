import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import type { Plant, Device } from "../../types";
import DeviceCard from "../../components/deviceComponent/DeviceCard";
import PlantPicker from "../../components/plants/PlantPicker";

// use the runtime loader you created in seedPlants.ts
import { seedPlants as loadPlantsFromApi } from "../../dataPlant/seedPlants"; // function

export default function PlantBrowserScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [q, setQ] = useState("");
  const pageSizeOptions = [5, 10, 20, 50];
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // load plants from backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadPlantsFromApi(); // returns Plant[]
        if (!alive) return;
        setPlants(result);
        // pick first plant if none selected yet
        if (!selectedPlantId && result.length > 0) {
          setSelectedPlantId(result[0].id);
        }
      } catch (e: any) {
        if (!alive) return;
        console.error("Failed to load plants:", e);
        setError(e?.message || "Failed to load plants.");
        setPlants([]); // keep app usable even on error
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // run once

  // when the list of plants changes, ensure the selected id is valid
  useEffect(() => {
    if (!plants.find((p) => p.id === selectedPlantId)) {
      setSelectedPlantId(plants[0]?.id ?? "");
    }
  }, [plants]);

  const selectedPlant: Plant = useMemo(
    () => plants.find((p) => p.id === selectedPlantId) ?? { id: "", name: "", devices: [] },
    [plants, selectedPlantId]
  );

  // reset to page 1 when inputs change
  useEffect(() => setPage(1), [selectedPlantId, q, pageSize]);

  const filtered: Device[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = selectedPlant.devices ?? [];
    if (!needle) return list;
    return list.filter((d) => {
      const hay = [
        d.name,
        d.id,
        d.type,
        d.system,
        d.area?.name,
        d.area?.level,
        d.scan?.qr,
        ...(d.tags ?? []),
        ...(d.docs?.map((doc) => `${doc.kind} ${doc.title}`) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [selectedPlant, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setPickerOpen(true)} style={[styles.selectBtn, styles.fullLine]}>
          <Text style={styles.selectBtnText}>
            {selectedPlant.name || (loading ? "Loading…" : "Select plant")}{" "}
            {!!selectedPlantId && <Text style={styles.sub}>({selectedPlantId})</Text>}
          </Text>
        </Pressable>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search devices (name, tag, area, docs)…"
          placeholderTextColor="#64748b"
          style={[styles.input, styles.fullLine]}
        />

        <Pressable
          onPress={() => {
            const idx = pageSizeOptions.indexOf(pageSize);
            const next = pageSizeOptions[(idx + 1) % pageSizeOptions.length];
            setPageSize(next);
          }}
          style={styles.pageSizeBtn}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Rows: {pageSize}</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={{ paddingVertical: 24 }}>
          <ActivityIndicator />
        </View>
      )}

      {error && <Text style={{ color: "#fecaca", marginBottom: 8 }}>Error: {error}</Text>}

      <Text style={styles.stats}>
        Showing {total === 0 ? 0 : start + 1}–{end} of {total} • {selectedPlant.devices.length} total
      </Text>

      <FlatList
        data={pageItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceCard d={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No matching devices.</Text> : null}
        contentContainerStyle={{ paddingBottom: 24 }}
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={10}
        removeClippedSubviews={false}   // ⬅️ don't clip long rows on Android
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.pager}>
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          style={[styles.pagerBtn, page <= 1 && styles.disabled]}
          disabled={page <= 1}
        >
          <Text style={styles.pagerText}>‹ Prev</Text>
        </Pressable>
        <Text style={styles.pageInfo}>
          Page <Text style={{ fontWeight: "800" }}>{page}</Text> / {totalPages}
        </Text>
        <Pressable
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          style={[styles.pagerBtn, page >= totalPages && styles.disabled]}
          disabled={page >= totalPages}
        >
          <Text style={styles.pagerText}>Next ›</Text>
        </Pressable>
      </View>

      <PlantPicker
        visible={pickerOpen}
        plants={plants}
        value={selectedPlantId}
        onClose={() => setPickerOpen(false)}
        onSelect={setSelectedPlantId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f172a", padding: 12 },

  // wrap to next line on narrow screens so nothing is hidden
  topBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 8,
    marginBottom: 8,
    alignItems: "stretch",
  },

  // force control to take a full row when wrapped
  fullLine: {
    flexBasis: "100%",
  },

  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  selectBtnText: { color: "#0f172a", fontWeight: "800", fontSize: 16 },
  sub: { color: "#64748b", fontWeight: "700" },

  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "white",
    color: "#0f172a",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },

  pageSizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#0284c7",
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },

  stats: { color: "#cbd5e1", marginBottom: 8 },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 24 },

  pager: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
  },
  pagerBtn: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  disabled: { opacity: 0.5 },
  pagerText: { color: "white", fontWeight: "700" },
  pageInfo: { color: "#cbd5e1", fontWeight: "600" },
});
