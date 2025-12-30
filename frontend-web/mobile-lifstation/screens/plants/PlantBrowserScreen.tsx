import React, { useMemo, useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, Pressable, StyleSheet, RefreshControl } from "react-native";
import type { Plant, Device } from "../../types";
import DeviceCard from "../../components/deviceComponent/DeviceCard";
import PlantPicker from "../../components/plants/PlantPicker";
import { fetchPlants, fetchDevicesByPlant } from "../../lib/api/plants";

export default function PlantBrowserScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [q, setQ] = useState("");
  const pageSizeOptions = [5, 10, 20, 50];
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ps = await fetchPlants();
      setPlants(ps);
      if (!selectedPlantId && ps.length) setSelectedPlantId(ps[0].id);
    } catch (e: any) {
      setError(e?.message || "Failed to load plants");
    } finally {
      setLoading(false);
    }
  }, [selectedPlantId]);

  const loadDevices = useCallback(
    async (plantId: string) => {
      if (!plantId) return;
      try {
        const devs = await fetchDevicesByPlant(plantId);
        setPlants((prev) =>
          prev.map((p) => (p.id === plantId ? { ...p, devices: devs } : p))
        );
      } catch (e: any) {
        setError(e?.message || `Failed to load devices for ${plantId}`);
      }
    },
    []
  );

  // initial load plants
  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  // load devices when selection changes
  useEffect(() => {
    if (selectedPlantId) loadDevices(selectedPlantId);
  }, [selectedPlantId, loadDevices]);

  // reset page on filters/selection
  useEffect(() => setPage(1), [selectedPlantId, q, pageSize]);

  const selectedPlant = useMemo(
    () => plants.find((p) => p.id === selectedPlantId) ?? { id: "", name: "", devices: [] as Device[] },
    [plants, selectedPlantId]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = selectedPlant.devices ?? [];
    if (!needle) return list;
    return list.filter((d) => {
      const hay = [
        d.name, d.id, d.type, d.system, d.area?.name, d.area?.level, d.scan?.qr,
        ...(d.tags ?? []),
        ...(d.docs?.map(doc => `${doc.kind} ${doc.title}`) ?? []),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [selectedPlant, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPlants();
      if (selectedPlantId) await loadDevices(selectedPlantId);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setPickerOpen(true)} style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>
            {selectedPlant.name || (loading ? "Loading…" : "Select plant")}{" "}
            <Text style={styles.sub}>{selectedPlantId ? `(${selectedPlantId})` : ""}</Text>
          </Text>
        </Pressable>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search devices (name or tag)…"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Pressable
          onPress={() => {
            const idx = pageSizeOptions.indexOf(pageSize);
            const next = pageSizeOptions[(idx + 1) % pageSizeOptions.length];
            setPageSize(next);
          }}
          style={styles.pageSizeBtn}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Rows: {pageSize}</Text>
        </Pressable>
      </View>

      {!!error && <Text style={{ color: "#fecaca", marginBottom: 8 }}>{error}</Text>}

      <Text style={styles.stats}>
        {loading ? "Loading…" : `Showing ${total === 0 ? 0 : start + 1}–${end} of ${total} • ${(selectedPlant.devices ?? []).length} total`}
      </Text>

      <FlatList
        data={pageItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeviceCard d={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? "Loading…" : "No matching devices."}</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
          Page <Text style={{ fontWeight: "700" }}>{page}</Text> / {totalPages}
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
        onSelect={(id) => {
          setSelectedPlantId(id);
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f172a", padding: 12 },
  topBar: { flexDirection: "row", gap: 8, marginBottom: 8 },
  selectBtn: { flexGrow: 1, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#1f2937", borderRadius: 10 },
  selectBtnText: { color: "white", fontWeight: "700" },
  sub: { color: "#64748b" },
  input: { flexGrow: 1.2, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "white", color: "#0f172a", borderRadius: 10 },
  pageSizeBtn: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#0284c7", borderRadius: 10 },
  stats: { color: "#cbd5e1", marginBottom: 8 },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 24 },
  pager: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8 },
  pagerBtn: { backgroundColor: "#1f2937", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  disabled: { opacity: 0.5 },
  pagerText: { color: "white", fontWeight: "600" },
  pageInfo: { color: "#cbd5e1" },
});
