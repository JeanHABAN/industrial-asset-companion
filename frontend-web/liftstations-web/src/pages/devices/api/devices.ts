import { api } from "../api/http";
import type { Device } from "../../devices/types";

// helper to send null instead of empty string/undefined
const val = (s?: string | null) => (s && s.trim() ? s.trim() : null);

const toCreateDto = (plantId: string, d: Device) => ({
  id: d.id,
  plantId,
  type: d.type ?? null,
  name: d.name ?? null,
  system: d.system ?? null,
  panel: val(d.loc?.panel),
  bucket: val(d.loc?.bucket),
  aisle: val(d.loc?.aisle),
  navText: val(d.loc?.navText),
  qr: val(d.scan?.qr),
  deviceCode: null,                 // add if you capture it in the UI
  // 👇 send ALL area info
  areaId: val(d.area?.id),
  areaName: val(d.area?.name),
  areaLevel: val(d.area?.level),
  tags: d.tags ?? [],
});

export async function listDevices(plantId: string): Promise<Device[]> {
  const { data } = await api.get<Device[]>("/devices", { params: { plantId } });
  return data.map((d) => ({
    ...d,
    area: d.area ?? undefined,
    loc: d.loc ?? { panel: "", bucket: "", aisle: "", navText: "" },
    scan: d.scan?.qr ? d.scan : undefined,
  }));
}

export async function createDevice(plantId: string, device: Device) {
  const dto = toCreateDto(plantId, device);
  const { data } = await api.post("/devices", dto);
  return data; // created DeviceListItemDto
}

export async function updateDevice(plantId: string, deviceId: string, device: Device) {
  const dto = toCreateDto(plantId, device);
  const { data } = await api.put(`/devices/${deviceId}`, dto);
  return data;
}

export async function deleteDevice(deviceId: string) {
  await api.delete(`/devices/${deviceId}`);
}
/** Tags helpers */
export async function replaceTags(id: string, tags: string[]): Promise<string[]> {
  const { data } = await api.put<string[]>(`/devices/${id}/tags`, tags);
  return data;
}
export async function addTags(id: string, tags: string[]): Promise<string[]> {
  const { data } = await api.post<string[]>(`/devices/${id}/tags`, tags);
  return data;
}
export async function removeTag(id: string, tag: string): Promise<string[]> {
  const { data } = await api.delete<string[]>(`/devices/${id}/tags/${encodeURIComponent(tag)}`);
  return data;
}
