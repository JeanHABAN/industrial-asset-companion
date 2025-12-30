import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchStations, StationSummary } from "../../lib/api/stations";
import { colors } from "../../constants/Colors";

type Page<T> = { content: T[]; totalPages: number; number: number; totalElements?: number };
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25,30,40,50];

export default function LiftStations() {
  const [items, setItems] = useState<StationSummary[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // prevent stale setState from older requests
  const inFlightKey = useRef<string>("");

  const load = useCallback(
    async (pageIndex: number) => {
      const key = `${debouncedQ}::${pageIndex}::${pageSize}`;
      inFlightKey.current = key;
      setLoading(true);
      try {
        const p: Page<StationSummary> = await fetchStations(pageIndex, pageSize, debouncedQ);
        if (inFlightKey.current !== key) return; // ignore stale

        setPage(p.number);
        setTotalPages(Math.max(1, p.totalPages));
        setItems(p.content);
      } finally {
        setLoading(false);
      }
    },
    [debouncedQ, pageSize]
  );

  // initial & when search/pageSize changes -> reset to page 0
  useEffect(() => {
    load(0);
  }, [debouncedQ, pageSize, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(0);
    setRefreshing(false);
  };

  const canPrev = page > 0 && !loading;
  const canNext = page + 1 < totalPages && !loading;

  const goPrev = () => {
    if (!canPrev) return;
    load(page - 1);
  };

  const goNext = () => {
    if (!canNext) return;
    load(page + 1);
  };

  // cycle page size on tap
  const cyclePageSize = () => {
    const idx = PAGE_SIZE_OPTIONS.indexOf(pageSize);
    const next = PAGE_SIZE_OPTIONS[(idx + 1) % PAGE_SIZE_OPTIONS.length];
    if (next !== pageSize) {
      setPageSize(next);
      setPage(0);
      // load(0) will be triggered by effect watching pageSize
    }
  };

  const footer = useMemo(
    () => (
      <View style={{ paddingTop: 12, paddingBottom: 24 }}>
        {loading && items.length === 0 ? (
          <ActivityIndicator />
        ) : (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Pressable
              onPress={goPrev}
              disabled={!canPrev}
              style={[
                {
                  backgroundColor: canPrev ? colors.card : "#2a2f3a",
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  opacity: canPrev ? 1 : 0.6,
                },
                Platform.OS === "web" ? ({ cursor: canPrev ? "pointer" : "not-allowed" } as any) : null,
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>‹ Prev</Text>
            </Pressable>

            <Text style={{ color: colors.sub }}>
              Page <Text style={{ color: colors.text, fontWeight: "700" }}>{page + 1}</Text> / {totalPages}
            </Text>

            <Pressable
              onPress={goNext}
              disabled={!canNext || loading}
              style={[
                {
                  backgroundColor: canNext && !loading ? colors.card : "#2a2f3a",
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  opacity: canNext && !loading ? 1 : 0.6,
                },
                Platform.OS === "web"
                  ? ({ cursor: canNext && !loading ? "pointer" : "not-allowed" } as any)
                  : null,
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>Next ›</Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [loading, items.length, canPrev, canNext, page, totalPages]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Controls */}
      <View
  style={{
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  }}
>
  {/* Search bar (left, expands) */}
  <TextInput
    placeholder="Search stations…"
    placeholderTextColor={colors.muted}
    value={q}
    onChangeText={setQ}
    autoCorrect={false}
    style={{
      flex: 1,
      backgroundColor: colors.bg,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    }}
    returnKeyType="search"
  />

  {/* Blue Rows button (right) */}
  <Pressable
    onPress={cyclePageSize}
    style={[
      {
        backgroundColor: "#0284c7", // bright blue background
        borderWidth: 1,
        borderColor: "#0369a1",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
      },
            Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null,
          ]}
        >
          <Text style={{ color: colors.text, fontWeight: "700" }}>Rows: {pageSize}</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: colors.sub, fontSize: 16, fontWeight: "600" }}>
          Showing {items.length} row{items.length === 1 ? "" : "s"} • Size {pageSize}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/station/stationDetail", params: { id: item.id } }} asChild>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.card,
                  borderRadius: 14,
                  marginBottom: 14,
                  padding: 18,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.07,
                  shadowRadius: 6,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null,
                pressed ? { opacity: 0.9 } : null,
              ]}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                {item.name} <Text style={{ color: colors.muted, fontWeight: "400" }}>({item.code})</Text>
              </Text>
              <Text style={{ color: colors.sub, marginTop: 6, fontSize: 15 }}>
                {item.pumpsCount ?? 0} pump{(item.pumpsCount ?? 0) === 1 ? "" : "s"} · {item.commsType || "—"}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 6, fontSize: 14 }}>
                {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}
              </Text>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 32, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.muted, fontSize: 16 }}>No stations found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={footer}
      />
    </SafeAreaView>
  );
}
