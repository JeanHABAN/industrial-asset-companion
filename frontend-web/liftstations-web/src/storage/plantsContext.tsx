import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Plant, Device } from "../../src/pages/devices/types";

// Plants API
import {
  getPlants,
  createPlant as apiCreatePlant,
  updatePlant as apiUpdatePlant,
  deletePlant as apiDeletePlant,
} from "../../src/pages/devices/api/plants";

// Devices API
import {
  listDevices as apiListDevices,
  createDevice as apiCreateDevice,
  updateDevice as apiUpdateDevice,
  deleteDevice as apiDeleteDevice,
  replaceTags as apiReplaceTags,
  addTags as apiAddTags,
  removeTag as apiRemoveTag,
} from "../../src/pages/devices/api/devices";

// Fallback mock
import { seedPlants } from "../pages/devices/mock/plants";

/* ---------------- Types & reducer ---------------- */

type State = { plants: Plant[] };

type Action =
  | { type: "plants/set"; plants: Plant[] }
  | { type: "plant/add"; plant: Plant }
  | { type: "plant/update"; plantId: string; patch: Partial<Omit<Plant, "id">> }
  | { type: "plant/delete"; plantId: string }
  | { type: "device/add"; plantId: string; device: Device }
  | {
      type: "device/update";
      plantId: string;
      deviceId: string;
      patch: Partial<Omit<Device, "id">>;
    }
  | { type: "device/delete"; plantId: string; deviceId: string };

const LS_KEY = "iac.plants";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "plants/set":
      return { plants: action.plants };

    case "plant/add": {
      if (state.plants.some((p) => p.id === action.plant.id)) {
        alert(`Plant ID "${action.plant.id}" already exists.`);
        return state;
      }
      return {
        plants: [
          ...state.plants,
          { ...action.plant, devices: action.plant.devices ?? [] },
        ],
      };
    }

    case "plant/update":
      return {
        plants: state.plants.map((p) =>
          p.id === action.plantId ? { ...p, ...action.patch } : p
        ),
      };

    case "plant/delete":
      return { plants: state.plants.filter((p) => p.id !== action.plantId) };

    case "device/add":
      return {
        plants: state.plants.map((p) =>
          p.id !== action.plantId
            ? p
            : p.devices.some((d) => d.id === action.device.id)
            ? p
            : { ...p, devices: [...p.devices, action.device] }
        ),
      };

    case "device/update":
      return {
        plants: state.plants.map((p) =>
          p.id !== action.plantId
            ? p
            : {
                ...p,
                devices: p.devices.map((d) =>
                  d.id === action.deviceId ? { ...d, ...action.patch } : d
                ),
              }
        ),
      };

    case "device/delete":
      return {
        plants: state.plants.map((p) =>
          p.id !== action.plantId
            ? p
            : { ...p, devices: p.devices.filter((d) => d.id !== action.deviceId) }
        ),
      };

    default:
      return state;
  }
}

type Ctx = State & {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // plant CRUD
  addPlant: (plant: { id: string; name: string }) => Promise<void>;
  updatePlant: (plantId: string, patch: { name: string }) => Promise<void>;
  deletePlant: (plantId: string) => Promise<void>;
  // device CRUD
  addDevice: (
    plantId: string,
    device: Omit<Device, "docs" | "tags"> & { tags?: string[] }
  ) => Promise<void>;
  updateDevice: (
    plantId: string,
    deviceId: string,
    patch: Partial<Omit<Device, "id">>
  ) => Promise<void>;
  deleteDevice: (plantId: string, deviceId: string) => Promise<void>;
  // tag helpers
  replaceTags: (deviceId: string, tags: string[]) => Promise<string[]>;
  addTags: (deviceId: string, tags: string[]) => Promise<string[]>;
  removeTag: (deviceId: string, tag: string) => Promise<string[]>;
};

const PlantsContext = createContext<Ctx | null>(null);

/* ---------------- Provider ---------------- */

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo<State>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return { plants: JSON.parse(raw) as Plant[] };
    } catch {}
    return { plants: seedPlants };
  }, []);

  const [state, dispatch] = useReducer(reducer, initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (plants: Plant[]): Plant[] =>
    plants.map((p) => ({ ...p, devices: p.devices ?? [] }));

  // Load plants + devices
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const plants = await getPlants(); // GET /api/plants -> [{ id, name }]
      const devicesMatrix = await Promise.all(
        plants.map((p) => apiListDevices(p.id)) // GET /api/devices?plantId=ID
      );

      const withDevices: Plant[] = plants.map((p, i) => ({
        ...p,
        devices: devicesMatrix[i] ?? [],
      }));

      const normalized = normalize(withDevices);
      dispatch({ type: "plants/set", plants: normalized });
      localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    } catch (err: any) {
      console.error("Failed to fetch plants/devices, fallback to mock:", err);
      setError(err?.message || "Failed to load plants.");
      const normalized = normalize(seedPlants);
      dispatch({ type: "plants/set", plants: normalized });
      localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // persist local changes too
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state.plants));
  }, [state.plants]);

  /* ---------- Server-backed CRUD ---------- */

  // PLANTS
  const addPlant = async (plant: { id: string; name: string }) => {
    const created = await apiCreatePlant(plant); // POST /api/plants
    dispatch({
      type: "plant/add",
      plant: { ...created, devices: created.devices ?? [] },
    });
  };

  const updatePlantFn = async (plantId: string, patch: { name: string }) => {
    const updated = await apiUpdatePlant(plantId, patch); // PUT /api/plants/{id}
    dispatch({ type: "plant/update", plantId, patch: { name: updated.name } });
  };

  const deletePlantFn = async (plantId: string) => {
    await apiDeletePlant(plantId); // DELETE /api/plants/{id}
    dispatch({ type: "plant/delete", plantId });
  };

  // DEVICES
  const addDeviceFn = async (
    plantId: string,
    device: Omit<Device, "docs" | "tags"> & { tags?: string[] }
  ) => {
    // let the /api/devices helper do the UI->DTO flattening
    const created = await apiCreateDevice(plantId, {
      ...device,
      tags: device.tags ?? [],
    });
    // created should come back in UI shape (area/loc/scan flattened by service)
    dispatch({ type: "device/add", plantId, device: created });
  };

  const updateDeviceFn = async (
    plantId: string,
    deviceId: string,
    patch: Partial<Omit<Device, "id">>
  ) => {
    // merge with current before sending (the API expects a full object to flatten)
    const currentPlant = state.plants.find((p) => p.id === plantId);
    const currentDevice = currentPlant?.devices.find((d) => d.id === deviceId);
    const merged: Device = { ...(currentDevice as Device), ...patch };

    const updated = await apiUpdateDevice(plantId, deviceId, merged);
    dispatch({ type: "device/update", plantId, deviceId, patch: updated });
  };

  const deleteDeviceFn = async (plantId: string, deviceId: string) => {
    await apiDeleteDevice(deviceId);
    dispatch({ type: "device/delete", plantId, deviceId });
  };

  // TAGS
  const replaceTagsFn = async (deviceId: string, tags: string[]) => {
    const res = await apiReplaceTags(deviceId, tags);
    const plant = state.plants.find((p) => p.devices.some((d) => d.id === deviceId));
    if (plant)
      dispatch({
        type: "device/update",
        plantId: plant.id,
        deviceId,
        patch: { tags: res },
      });
    return res;
  };

  const addTagsFn = async (deviceId: string, tags: string[]) => {
    const res = await apiAddTags(deviceId, tags);
    const plant = state.plants.find((p) => p.devices.some((d) => d.id === deviceId));
    if (plant)
      dispatch({
        type: "device/update",
        plantId: plant.id,
        deviceId,
        patch: { tags: res },
      });
    return res;
  };

  const removeTagFn = async (deviceId: string, tag: string) => {
    const res = await apiRemoveTag(deviceId, tag);
    const plant = state.plants.find((p) => p.devices.some((d) => d.id === deviceId));
    if (plant)
      dispatch({
        type: "device/update",
        plantId: plant.id,
        deviceId,
        patch: { tags: res },
      });
    return res;
  };

  const value: Ctx = {
    ...state,
    loading,
    error,
    refresh,
    // plants
    addPlant,
    updatePlant: updatePlantFn,
    deletePlant: deletePlantFn,
    // devices
    addDevice: addDeviceFn,
    updateDevice: updateDeviceFn,
    deleteDevice: deleteDeviceFn,
    // tags
    replaceTags: replaceTagsFn,
    addTags: addTagsFn,
    removeTag: removeTagFn,
  };

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

/* ------------- Hook ------------- */

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error("usePlants must be used within PlantsProvider");
  return ctx;
}
