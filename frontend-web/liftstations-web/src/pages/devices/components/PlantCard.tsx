import { useEffect, useMemo, useState } from "react";
import type { Plant } from "../types";
import { DeviceCard } from "./DeviceCard";

type Props = {
  plant: Plant;
  deviceQuery?: string;
  onDeviceQueryChange?: (q: string) => void;

  // CRUD (optional)
  onAddDevice?: (plantId: string) => void;
  onEditPlant?: (plantId: string) => void;
  onDeletePlant?: (plantId: string) => void;
  onEditDevice?: (plantId: string, deviceId: string) => void;
  onDeleteDevice?: (plantId: string, deviceId: string) => void;
  deletingPlantId?: string;
  deletingDeviceId?: string;
  // Pagination defaults (optional)
  initialPageSize?: number; // e.g., 10
  pageSizeOptions?: number[]; // e.g., [5,10,20,50]
};

export function PlantCard({
  plant,
  deviceQuery,
  onDeviceQueryChange,
  onAddDevice,
  onEditPlant,
  onDeletePlant,
  onEditDevice,
  onDeleteDevice,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: Props) {
  const hasExternal = typeof deviceQuery === "string";
  const [localQ, setLocalQ] = useState("");
  const q = hasExternal ? (deviceQuery as string) : localQ;

  const devices = plant.devices ?? [];

  // ---- FILTER (name/tag/etc.) ----
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return devices;

    return devices.filter((d) => {
      const haystack = [
        d.name,
        d.id, // tag
        d.type,
        d.system,
        d.area?.name,
        d.area?.level,
        d.scan?.qr,
        ...(d.tags ?? []),
        ...(d.docs?.map((doc) => `${doc.kind} ${doc.title}`) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [devices, q]);

  // ---- PAGINATION ----
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  // Reset to page 1 when plant changes, query changes, or pageSize changes
  useEffect(() => setPage(1), [plant.id, q, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="border rounded-xl p-6 bg-white text-slate-900 shadow mb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{plant.name}</h2>
          <p className="text-sm text-slate-600">
            Showing{" "}
            {total === 0 ? 0 : startIdx + 1}
            –
            {endIdx} of {total} match{total === 1 ? "" : "es"} • {devices.length} device
            {devices.length === 1 ? "" : "s"} total
          </p>
        </div>

        {/* Actions + Search */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="border rounded-lg px-3 py-2 text-sm"
            onClick={() => onAddDevice?.(plant.id)}
          >
            + Add Device
          </button>
          <button
            className="border rounded-lg px-3 py-2 text-sm"
            onClick={() => onEditPlant?.(plant.id)}
          >
            Edit Plant
          </button>
          <button
            className="border rounded-lg px-3 py-2 text-sm text-red-600"
            onClick={() => onDeletePlant?.(plant.id)}
          >
            Delete Plant
          </button>

          {/* Search */}
          <input
            type="text"
            value={q}
            onChange={(e) =>
              hasExternal ? onDeviceQueryChange?.(e.target.value) : setLocalQ(e.target.value)
            }
            placeholder="Search devices by name or tag…"
            className="border rounded-lg px-3 py-2 w-64 bg-white text-slate-900 placeholder-slate-500"
            aria-label={`Search devices in ${plant.name}`}
          />
          {q && (
            <button
              onClick={() => (hasExternal ? onDeviceQueryChange?.("") : setLocalQ(""))}
              className="border rounded-lg px-3 py-2 text-sm"
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Device list (current page) */}
      {pageItems.length === 0 ? (
        <p className="text-slate-500 italic">No matching devices.</p>
      ) : (
        <div>
          {pageItems.map((d) => (
            <DeviceCard
              key={d.id}
              device={d}
              onEdit={(id) => onEditDevice?.(plant.id, id)}
              onDelete={(id) => onDeleteDevice?.(plant.id, id)}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          <span className="text-sm">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700">Rows per page</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 bg-white text-slate-900"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
