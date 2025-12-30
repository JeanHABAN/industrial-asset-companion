import type { MetricQuality } from "../../types/scada";

export function qualityBg(q?: MetricQuality) {
  switch (q) {
    case "GOOD": return "#0b1220";
    case "WARN": return "#1f2a19";
    case "ALARM": return "#2a1515";
    default: return "#111827";
  }
}
export function qualityText(q?: MetricQuality) {
  switch (q) {
    case "GOOD": return "#86efac";  // green-300
    case "WARN": return "#fde68a";  // yellow-300
    case "ALARM": return "#fca5a5"; // red-300
    default: return "#e5e7eb";      // slate-200
  }
}