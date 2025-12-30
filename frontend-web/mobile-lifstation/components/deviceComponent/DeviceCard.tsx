// components/deviceComponent/DeviceCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Device } from "../../types";

export default function DeviceCard({ d }: { d: Device }) {
  return (
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>
        {d.name} <Text style={styles.sub}>({d.type})</Text>
      </Text>

      <InfoRow label="Tag" value={d.id} />
      <InfoRow label="System" value={d.system} />
      <InfoRow
        label="Area"
        value={
          d?.area?.name
            ? `${d.area.name}${d.area.level ? ` (${d.area.level})` : ""}`
            : "—"
        }
      />
      <InfoRow label="Location" value={d?.loc?.navText || "—"} />
      <InfoRow
        label="Panel / Bucket / Aisle"
        value={`${d?.loc?.panel || "—"} / ${d?.loc?.bucket || "—"} / ${d?.loc?.aisle || "—"}`}
      />

      {d.tags?.length ? <InfoRow label="Tags" value={d.tags.join(", ")} /> : null}

      {d.docs?.length ? (
        <View style={{ marginTop: 6 }}>
          <Text style={styles.label}>Documents:</Text>
          {d.docs.map((doc) => (
            <Text key={doc.id} style={styles.docText}>
              • {doc.kind}: {doc.title}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ──────────────────────────────────────────────── */
/* Subcomponent                                    */
/* ──────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ──────────────────────────────────────────────── */
/* Dark styles                                     */
/* ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827", // dark slate
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb", // text-slate-200
    marginBottom: 8,
    flexWrap: "wrap",
  },
  sub: { color: "#94a3b8" }, // text-slate-400
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "700",
    color: "#cbd5e1", // text-slate-300
    minWidth: 120, // a bit wider on dark to keep columns aligned
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
    color: "#e5e7eb", // text-slate-200
    lineHeight: 20,
  },
  docText: {
    color: "#e5e7eb",
    marginLeft: 12,
    marginTop: 2,
    flexWrap: "wrap",
    lineHeight: 20,
  },
});
