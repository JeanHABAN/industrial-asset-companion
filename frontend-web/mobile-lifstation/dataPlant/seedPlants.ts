//import type { Plant } from "../types";

// export const seedPlants: Plant[] = [
//   {
//     id: "ULL",
//     name: "Ullrich WTP",
//     devices: [
//       {
//         id: "PT-0102",
//         name: "Filter Influent Pressure",
//         type: "PT",
//         system: "Filters",
//         area: { id: "A1", name: "Filter Gallery", level: "L1" },
//         loc: { panel: "MCC-2", bucket: "3", aisle: "B", navText: "North door → Aisle B → MCC-2" },
//         scan: { qr: "PT-0102" },
//         tags: ["PT-0102", "pressure", "PT", "filter", "influent", "Rosemount", "3051"],
//         docs: [
//           { id: "D1", kind: "Spec Sheet", title: "Rosemount 3051" },
//           { id: "D2", kind: "Wiring", title: "MCC-2 Layout" },
//         ],
//       },
//       {
//         id: "FCV-201",
//         name: "Filter Effluent Valve",
//         type: "FCV",
//         system: "Filters",
//         area: { id: "A1", name: "Filter Gallery", level: "L1" },
//         loc: { panel: "LC-1", bucket: "7", aisle: "C", navText: "South door → Aisle C → LC-1" },
//         tags: ["FCV-201", "valve", "effluent", "filter", "actuator", "MOV", "LSO", "LSC"],
//         docs: [
//           { id: "D3", kind: "Manual", title: "EIM/Rotork Actuator Guide" },
//           { id: "D4", kind: "P&ID", title: "Filter Effluent Line" },
//         ],
//       },
//     ],
//   },
//   { id: "SAR", name: "South Austin Regional", devices: [] },
//   { id: "ULL-REMOTE", name: "Ullrich Remote LS", devices: [] },
// ];

// src/dataPlant/seedPlants.ts
// Replace the old static array with a live fetch from your backend.
// Usage change: call `const plants = await seedPlants()` where you previously used the constant.

import type { Plant, Device } from "../types";
import { API_BASE } from "../lib/api/base";

/* ---------------- helpers ---------------- */

async function httpGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && `${v}`.length > 0)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as any)}`)
        .join("&")
    : "";
  const res = await fetch(`${API_BASE}${path}${qs}`, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text ? `– ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function mapDevice(raw: any): Device {
  return {
    id: raw.id,
    name: raw.name ?? "",
    type: raw.type ?? "",
    system: raw.system ?? "",
    area: raw.area
      ? { id: raw.area.id ?? "", name: raw.area.name ?? "", level: raw.area.level ?? "" }
      : { id: "", name: "", level: "" },
    loc: {
      panel: raw.loc?.panel ?? "",
      bucket: raw.loc?.bucket ?? "",
      aisle: raw.loc?.aisle ?? "",
      navText: raw.loc?.navText ?? "",
    },
    scan: raw.scan?.qr ? { qr: raw.scan.qr } : undefined,
    docs: raw.docs ?? [],   // backend may return []; keep shape
    tags: raw.tags ?? [],
  };
}

/* ---------------- public API ---------------- */

/**
 * Load plants (and their devices) from the backend.
 * Backend:
 *  - GET /api/plants -> [{ id, name, ... }]
 *  - GET /api/devices?plantId=XXX -> DeviceListItemDto[]
 */
export async function seedPlants(): Promise<Plant[]> {
  // 1) fetch plants
  const plantsRaw = await httpGet<any[]>("/plants");

  // 2) for each plant, fetch its devices in parallel
  const plants: Plant[] = await Promise.all(
    (plantsRaw ?? []).map(async (p) => {
      let devices: Device[] = [];
      try {
        const list = await httpGet<any[]>("/devices", { plantId: p.id });
        devices = (list ?? []).map(mapDevice);
      } catch {
        devices = [];
      }
      return { id: p.id, name: p.name, devices };
    })
  );

  return plants;
}
