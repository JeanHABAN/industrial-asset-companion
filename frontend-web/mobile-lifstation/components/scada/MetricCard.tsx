import React from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { Link } from "expo-router";
import type { Metric } from "../../types/scada";
import { qualityBg, qualityText } from "@/lib/ui/quality";
import { formatVal } from "@/lib/ui/format";

export function MetricCard({ m }: { m: Metric }) {
  const bg = qualityBg(m.quality);
  const fg = qualityText(m.quality);
  const value = m.value === null || m.value === undefined ? "—" : formatVal(m.value);
  const unit = m.unit ? ` ${m.unit}` : "";

  const body = (
    <View style={[styles.card, { backgroundColor: bg, borderColor: "#1f2937" }]}>
      <Text style={styles.metricName}>{m.name}</Text>
      <Text style={[styles.value, { color: fg }]}>
        {value}
        <Text style={styles.unit}>{unit}</Text>
      </Text>
      <Text style={styles.tag}>{m.tag}</Text>
    </View>
  );

  return m.deviceId ? (
    <Link href={{ pathname: "/devices", params: { q: m.deviceId } }} asChild>
      <Pressable style={({ pressed }) => [pressed && { opacity: 0.9 }, webCursor()]}>{body}</Pressable>
    </Link>
  ) : body;
}

function webCursor() {
  return Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {};
}

const styles = StyleSheet.create({
  card: {
    flex: 1, borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 112,
    justifyContent: "space-between", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  metricName: { color: "#cbd5e1", fontWeight: "700" },
  value: { fontSize: 24, fontWeight: "900", marginTop: 8 },
  unit: { color: "#9ca3af", fontSize: 14, fontWeight: "700" },
  tag: { color: "#94a3b8", marginTop: 8, fontSize: 12 },
});
