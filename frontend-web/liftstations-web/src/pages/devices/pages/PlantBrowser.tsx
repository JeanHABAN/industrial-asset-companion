// src/pages/PlantBrowser.tsx
import { useMemo, useState } from "react";
import type { Plant } from "../types";
import { PlantCard } from "../components/PlantCard";

export default function PlantBrowser({ plants }: { plants: Plant[] }) {
  const [plantSearch, setPlantSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("ALL");
  const [deviceQuery, setDeviceQuery] = useState<string>(""); // ← global device search

  const filteredPlants = useMemo(() => {
    const q = plantSearch.trim().toLowerCase();
    if (!q) return plants;
    return plants.filter((p) => p.name.toLowerCase().includes(q));
  }, [plants, plantSearch]);

  const selectedPlant = useMemo(() => {
    if (selectedId === "ALL") return null;
    return plants.find((p) => p.id === selectedId) || null;
  }, [plants, selectedId]);

  const totalDevices = useMemo(
    () => plants.reduce((sum, p) => sum + (p.devices?.length || 0), 0),
    [plants]
  );

  return (
    <div className="p-6 space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Plants</h1>
          <p className="text-sm text-gray-600">
            {plants.length} plant{plants.length === 1 ? "" : "s"} • {totalDevices} device
            {totalDevices === 1 ? "" : "s"}
          </p>
        </div>

        {/* Controls: plant filter, plant select, and global device search */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            type="text"
            value={plantSearch}
            onChange={(e) => setPlantSearch(e.target.value)}
            placeholder="Filter plants by name…"
            className="border rounded-lg px-3 py-2 w-full md:w-64"
          />

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-56"
          >
            <option value="ALL">All plants</option>
            {filteredPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Global device search */}
          <input
            type="text"
            value={deviceQuery}
            onChange={(e) => setDeviceQuery(e.target.value)}
            placeholder={
              selectedId === "ALL"
                ? "Search devices (all plants)…"
                : "Search devices (selected plant)…"
            }
            className="border rounded-lg px-3 py-2 w-full md:w-72"
          />
          {deviceQuery && (
            <button
              onClick={() => setDeviceQuery("")}
              className="border rounded-lg px-3 py-2 text-sm"
              title="Clear device search"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      {selectedId === "ALL" ? (
        <div className="space-y-6">
          {plants.length === 0 ? (
            <p className="text-gray-500 italic">No plants found.</p>
          ) : (
            filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                deviceQuery={deviceQuery}              // ← pass global search
                onDeviceQueryChange={setDeviceQuery}   // ← keep it controlled
              />
            ))
          )}
        </div>
      ) : selectedPlant ? (
        <PlantCard
          plant={selectedPlant}
          deviceQuery={deviceQuery}
          onDeviceQueryChange={setDeviceQuery}
        />
      ) : (
        <p className="text-gray-500 italic">No plant matches the selection.</p>
      )}
    </div>
  );
}
