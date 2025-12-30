import type { Plant, Device } from "../../types";
import { http } from "./http";

/** Map backend DeviceListItemDto -> frontend Device */
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
    docs: raw.docs ?? [],          // backend returns [] today
    tags: raw.tags ?? [],
  };
}

/** GET /api/plants */
export async function fetchPlants(): Promise<Plant[]> {
  const data = await http.get<any[]>("/plants");
  // Backend returns Plant without devices; we’ll load devices per plant.
  return (data ?? []).map((p) => ({ id: p.id, name: p.name, devices: [] as Device[] }));
}

/** GET /api/devices?plantId=XXX */
export async function fetchDevicesByPlant(plantId: string): Promise<Device[]> {
  const data = await http.get<any[]>("/devices", { plantId });
  return (data ?? []).map(mapDevice);
}
