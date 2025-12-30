export type MetricQuality = "GOOD" | "WARN" | "ALARM" | "UNKNOWN";

export type Metric = {
  tag: string;               // unique key (e.g., "PH-101")
  name: string;              // grouping label: "pH", "Turbidity", "Free Chlor"...
  unit: string;              // "", "NTU", "mg/L", "°C", ...
  value: number | null;      // current value
  quality?: MetricQuality;   // GOOD | WARN | ALARM | UNKNOWN
  deviceId?: string;         // to deep-link to device screen
};

export type Snapshot = {
  plantId?: string;
  plantName?: string;
  timestamp: string;         // ISO time
  metrics: Metric[];
};

// Plants
export type Plant = {
  id: string;
  name: string;
};