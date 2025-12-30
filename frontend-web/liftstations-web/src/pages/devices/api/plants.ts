// src/api/plants.ts
import type { Plant } from "../types";
import { api } from "./http";

export async function getPlants(): Promise<Plant[]> {
  // backend endpoint: GET /plants  -> returns Plant[]
  const { data } = await api.get<Plant[]>("/plants");
  return data;
}

export async function getPlant(id: string): Promise<Plant> {
  const { data } = await api.get<Plant>(`/plants/${id}`);
  return data;
}

/** Create a plant */
export async function createPlant(payload: { id: string; name: string }): Promise<Plant> {
  const { data } = await api.post<Plant>("/plants", payload);
  return { ...data, devices: data.devices ?? [] };
}

/** Update a plant */
export async function updatePlant(id: string, payload: { name: string }): Promise<Plant> {
  const { data } = await api.put<Plant>(`/plants/${id}`, payload);
  return { ...data, devices: data.devices ?? [] };
}

/** Delete a plant */
export async function deletePlant(id: string): Promise<void> {
  await api.delete(`/plants/${id}`);
}