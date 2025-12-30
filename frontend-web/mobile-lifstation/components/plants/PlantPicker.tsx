import React, { useMemo, useState } from "react";
import { Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import type { Plant } from "../../types";

type Props = {
  visible: boolean;
  plants: Plant[];
  value: string;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export default function PlantPicker({ visible, plants, value, onClose, onSelect }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? plants.filter(p => p.name.toLowerCase().includes(n)) : plants;
  }, [plants, q]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Select Plant</Text>
          <TextInput
            value={q} onChangeText={setQ}
            placeholder="Filter plants…" placeholderTextColor="#6b7280" style={styles.input}
          />
          <FlatList
            data={filtered} keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item.id); onClose(); }}
                style={[styles.option, item.id === value && { borderColor: "#0284c7" }]}
              >
                <Text style={styles.optionText}>{item.name} <Text style={{ color: "#64748b" }}>({item.id})</Text></Text>
              </Pressable>
            )}
            style={{ maxHeight: 360 }}
          />
          <View style={{ height: 12 }} />
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "white", fontWeight: "600" }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 },
  box: { backgroundColor: "white", width: "100%", maxWidth: 520, borderRadius: 14, padding: 14 },
  title: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "white", color: "#0f172a", borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "white" },
  optionText: { color: "#0f172a", fontWeight: "600" },
  closeBtn: { alignSelf: "flex-end", backgroundColor: "#0ea5e9", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
});
