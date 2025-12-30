import { useMemo, useState } from "react";
import { usePlants } from "../../../storage/plantsContext";
import { PlantCard } from "../components/PlantCard";
import Modal from "../components/Modal";
import PlantForm from "../components/PlantForm";
import DeviceForm from "../components/DeviceForm";
import type { Plant, Device } from "../types";

export default function ManagePlantsPage() {
  const {
    plants,
    addPlant,
    updatePlant,
    deletePlant,
    addDevice,
    updateDevice,
    deleteDevice,
    loading,
    error,
    refresh,
  } = usePlants();

  // UI state
  const [plantFilter, setPlantFilter] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>("ALL");
  const [deviceQuery, setDeviceQuery] = useState<string>("");

  // Modal state
  const [openPlantModal, setOpenPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [devicePlantId, setDevicePlantId] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Submit-blockers
  const [savingPlant, setSavingPlant] = useState(false);
  const [savingDevice, setSavingDevice] = useState(false);
  const [deletingIds, setDeletingIds] = useState<{ plant?: string; device?: string }>({});

  // Derived
  const filteredPlants = useMemo(() => {
    const q = plantFilter.trim().toLowerCase();
    if (!q) return plants;
    return plants.filter((p) => p.name.toLowerCase().includes(q));
  }, [plants, plantFilter]);

  const selectedPlant = useMemo(() => {
    if (selectedPlantId === "ALL") return null;
    return plants.find((p) => p.id === selectedPlantId) || null;
  }, [plants, selectedPlantId]);

  const totalDevices = useMemo(
    () => plants.reduce((sum, p) => sum + (p.devices?.length || 0), 0),
    [plants]
  );

  // Handlers: Plant
  function handleCreatePlant() {
    setEditingPlant(null);
    setOpenPlantModal(true);
  }
  function handleEditPlant(plantId: string) {
    const p = plants.find((x) => x.id === plantId);
    if (!p) return;
    setEditingPlant(p);
    setOpenPlantModal(true);
  }
  async function handleDeletePlant(plantId: string) {
    if (!confirm("Delete this plant? (It must have no devices)")) return;
    try {
      setDeletingIds((s) => ({ ...s, plant: plantId }));
      await deletePlant(plantId);
      if (selectedPlantId === plantId) setSelectedPlantId("ALL");
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete plant.");
    } finally {
      setDeletingIds((s) => ({ ...s, plant: undefined }));
    }
  }

  // Handlers: Device
  function handleAddDevice(plantId: string) {
    setDevicePlantId(plantId);
    setEditingDevice(null);
    setOpenDeviceModal(true);
  }
  function handleEditDevice(plantId: string, deviceId: string) {
    const p = plants.find((x) => x.id === plantId);
    const d = p?.devices.find((x) => x.id === deviceId) || null;
    setDevicePlantId(plantId);
    setEditingDevice(d);
    setOpenDeviceModal(true);
  }
  async function handleDeleteDevice(plantId: string, deviceId: string) {
    if (!confirm(`Delete device ${deviceId}?`)) return;
    try {
      setDeletingIds((s) => ({ ...s, device: deviceId }));
      await deleteDevice(plantId, deviceId);
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete device.");
    } finally {
      setDeletingIds((s) => ({ ...s, device: undefined }));
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header + global controls */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Plants</h1>
          <p className="text-sm text-gray-600">
            {plants.length} plant{plants.length === 1 ? "" : "s"} • {totalDevices} device{totalDevices === 1 ? "" : "s"}
          </p>
          {loading ? <p className="text-xs text-gray-500">Loading…</p> : null}
          {error ? (
            <p className="text-xs text-red-600">Error: {error} <button className="underline" onClick={refresh}>Retry</button></p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 md:items-center">
          <button className="border rounded-lg px-3 py-2" onClick={handleCreatePlant} disabled={savingPlant || loading}>
            + New Plant
          </button>

          <input
            type="text"
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            placeholder="Filter plants by name…"
            className="border rounded-lg px-3 py-2 w-full md:w-56 bg-white text-slate-900 placeholder-slate-500"
          />

          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-52 bg-white text-slate-900"
          >
            <option value="ALL">All plants</option>
            {filteredPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={deviceQuery}
            onChange={(e) => setDeviceQuery(e.target.value)}
            placeholder={selectedPlantId === "ALL" ? "Search devices (all)…" : "Search devices (selected)…"}
            className="border rounded-lg px-3 py-2 w-full md:w-64 bg-white text-slate-900 placeholder-slate-500"
          />
          {deviceQuery && (
            <button className="border rounded-lg px-3 py-2 text-sm" onClick={() => setDeviceQuery("")}>
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      {selectedPlantId === "ALL" ? (
        <div className="space-y-6">
          {filteredPlants.length === 0 ? (
            <p className="text-gray-500 italic">No plants found.</p>
          ) : (
            filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                deviceQuery={deviceQuery}
                onDeviceQueryChange={setDeviceQuery}
                onAddDevice={handleAddDevice}
                onEditPlant={handleEditPlant}
                onDeletePlant={handleDeletePlant}
                onEditDevice={handleEditDevice}
                onDeleteDevice={handleDeleteDevice}
                deletingPlantId={deletingIds.plant}
                deletingDeviceId={deletingIds.device}
              />
            ))
          )}
        </div>
      ) : selectedPlant ? (
        <PlantCard
          plant={selectedPlant}
          deviceQuery={deviceQuery}
          onDeviceQueryChange={setDeviceQuery}
          onAddDevice={handleAddDevice}
          onEditPlant={handleEditPlant}
          onDeletePlant={handleDeletePlant}
          onEditDevice={handleEditDevice}
          onDeleteDevice={handleDeleteDevice}
          deletingPlantId={deletingIds.plant}
          deletingDeviceId={deletingIds.device}
        />
      ) : (
        <p className="text-gray-500 italic">No plant matches the selection.</p>
      )}

      {/* Plant Modal */}
      <Modal
        open={openPlantModal}
        title={editingPlant ? "Edit Plant" : "New Plant"}
        onClose={() => (savingPlant ? null : setOpenPlantModal(false))}
      >
        <PlantForm
          initial={editingPlant ?? {}}
          isEdit={!!editingPlant}
          onCancel={() => (savingPlant ? null : setOpenPlantModal(false))}
          onSubmit={async (plant) => {
            try {
              setSavingPlant(true);
              if (editingPlant) {
                await updatePlant(editingPlant.id, { name: plant.name });
              } else {
                // ensure devices array exists
                await addPlant({ id: plant.id, name: plant.name });
              }
              setOpenPlantModal(false);
            } catch (e: any) {
              alert(e?.message ?? "Failed to save plant.");
            } finally {
              setSavingPlant(false);
            }
          }}
        />
      </Modal>

      {/* Device Modal */}
      <Modal
        open={openDeviceModal}
        title={editingDevice ? "Edit Device" : "Add Device"}
        onClose={() => (savingDevice ? null : setOpenDeviceModal(false))}
      >
        <DeviceForm
          initial={editingDevice ?? {}}
          isEdit={!!editingDevice}
          onCancel={() => (savingDevice ? null : setOpenDeviceModal(false))}
          onSubmit={async (device) => {
            if (!devicePlantId) return;
            try {
              setSavingDevice(true);
              if (editingDevice) {
                const { id, ...patch } = device; // do not allow ID change
                await updateDevice(devicePlantId, editingDevice.id, patch);
              } else {
                await addDevice(devicePlantId, device);
              }
              setOpenDeviceModal(false);
            } catch (e: any) {
              alert(e?.message ?? "Failed to save device.");
            } finally {
              setSavingDevice(false);
            }
          }}
        />
      </Modal>
    </div>
  );
}
