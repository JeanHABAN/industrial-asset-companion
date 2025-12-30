import { apiGet } from "./base";
import type { Snapshot } from "../../types/scada";

// GET /api/scada/readings?plantId=ULLRICH
export function fetchScadaSnapshot(plantId?: string): Promise<Snapshot> {
  const qs = plantId ? `?plantId=${encodeURIComponent(plantId)}` : "";
  return apiGet<Snapshot>(`/scada/readings${qs}`);
}