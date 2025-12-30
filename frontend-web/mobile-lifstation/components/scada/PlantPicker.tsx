import React, { useMemo, useState } from "react";
import { View, Text, Modal, Pressable, FlatList, TextInput, StyleSheet } from "react-native";
import type { Plant } from "../../types/scada";
import { colors } from "../../constants/Colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function PlantPicker({
  visible, onClose, plants, currentPlantId, onSelect,
}: {
  visible: boolean;
  plants: Plant[];
  currentPlantId?: string;
  onClose: () => void;
  onSelect: (p?: Plant) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return plants;
    return plants.filter(p => p.name.toLowerCase().includes(n) || p.id.toLowerCase().includes(n));
  }, [q, plants]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <IconSymbol name="building.2" size={18} color="#cfe1ff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Choose Plant</Text>
          </View>

          <TextInput
            placeholder="Search plants…"
            placeholderTextColor="#94a3b8"
            style={s.search}
            value={q}
            onChangeText={setQ}
          />

          <Pressable
            onPress={() => onSelect(undefined)}
            style={[s.row, currentPlantId === undefined && s.rowActive]}
          >
            <Text style={s.rowText}>All plants</Text>
            {currentPlantId === undefined && <IconSymbol name="checkmark.circle.fill" size={16} color="#93c5fd" />}
          </Pressable>

          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            style={{ maxHeight: 320 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={[s.row, currentPlantId === item.id && s.rowActive]}
              >
                <Text style={s.rowText}>{item.name}</Text>
                {currentPlantId === item.id && <IconSymbol name="checkmark.circle.fill" size={16} color="#93c5fd" />}
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#0b1220", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  search: {
    borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    color: "#e5e7eb", marginBottom: 10,
  },
  row: {
    backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  rowActive: { borderColor: "#2563eb" },
  rowText: { color: "#e5e7eb", fontWeight: "700" },
});
