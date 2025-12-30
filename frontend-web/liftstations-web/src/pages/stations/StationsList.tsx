// src/pages/stations/StationsList.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchStationSummaries, deleteStation } from "../../api/stations";
import MapPinButton, { type LiftStation } from "./MapPinButton";

/** Map API row -> LiftStation required by MapPinButton */
function toLiftStation(row: any): LiftStation {
  return {
    id: String(row.id),
    code: row.code ?? "",
    name: row.name ?? "",
    latitude: typeof row.latitude === "number" ? row.latitude : undefined,
    longitude: typeof row.longitude === "number" ? row.longitude : undefined,
    address: row.address ?? null,
  };
}

/* ---------------------------- tiny toast system --------------------------- */
type Toast = { id: number; type: "success" | "error" | "info"; text: string };

function Toasts({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 space-y-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            t.type === "success"
              ? "toast toast-ok"
              : t.type === "error"
                ? "toast toast-err"
                : "toast toast-info"
          }
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{t.text}</span>
            <button
              onClick={() => onClose(t.id)}
              className="text-slate-300 hover:text-white"
              aria-label="Dismiss notification"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StationsList() {
  const [sp, setSp] = useSearchParams();

  // page in URL is 0-based for backend
  const page = Math.max(0, Number(sp.get("page") ?? 0));
  const q = sp.get("q") ?? "";

  // debounce the search box so we don't refetch on every keystroke
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      setSp((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set("q", searchInput);
        else next.delete("q");
        next.set("page", "0"); // reset to first page on new search
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, setSp]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stations", { q, page }],
    queryFn: () => fetchStationSummaries({ q, page, size: 50 }),
    placeholderData: keepPreviousData,
  });

  const items = useMemo(() => data?.content ?? [], [data?.content]);
  const totalPages = data?.totalPages ?? 1;

  /* ---------------------------- toast controller ---------------------------- */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(1);
  const showToast = (type: Toast["type"], text: string) => {
    const id = nextToastId.current++;
    setToasts((ts) => [...ts, { id, type, text }]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id));
    }, 3000);
  };
  const closeToast = (id: number) =>
    setToasts((ts) => ts.filter((t) => t.id !== id));

  /* --------------------------- optimistic delete --------------------------- */
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteStation(id),
    // Optimistic update
    onMutate: async (id) => {
      setDeletingId(id);
      showToast("info", "Deleting…");

      // Cancel ongoing queries for any stations lists
      await qc.cancelQueries({ queryKey: ["stations"] });

      // Snapshot all matching queries so we can roll back on error
      const snapshots = qc.getQueriesData<any>({ queryKey: ["stations"] });

      // Optimistically remove the row from each cached page
      snapshots.forEach(([key, old]) => {
        if (!old || !old.content) return;
        const filtered = old.content.filter((r: any) => String(r.id) !== id);
        const next = {
          ...old,
          content: filtered,
          totalElements:
            typeof old.totalElements === "number"
              ? Math.max(0, old.totalElements - 1)
              : old.totalElements,
        };
        qc.setQueryData(key as any, next);
      });

      return { snapshots };
    },
    onError: (err: any, _id, ctx) => {
      // Roll back
      ctx?.snapshots?.forEach(([key, data]: any) =>
        qc.setQueryData(key as any, data)
      );
      showToast("error", err?.message || "Failed to delete station");
      setDeletingId(null);
    },
    onSuccess: () => {
      showToast("success", "Station deleted");
    },
    onSettled: async () => {
      setDeletingId(null);
      // Ensure server is the source of truth after optimistic change
      await qc.invalidateQueries({ queryKey: ["stations"] });
    },
  });

  const handleDelete = useCallback(
    (id: string, code?: string) => {
      const ok = window.confirm(
        `Delete station ${code ? `"${code}" ` : ""}permanently? This action cannot be undone.`
      );
      if (!ok) return;
      delMutation.mutate(id);
    },
    [delMutation]
  );

  if (isLoading) return <div>Loading…</div>;
  if (isError)
    return (
      <div style={{ color: "tomato" }}>
        Error: {String((error as any)?.message || error)}
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Toasts */}
      <Toasts toasts={toasts} onClose={closeToast} />

      {/* Search bar */}
      <div className="flex gap-2 items-center">
        <input
          className="input w-72"
          placeholder="Search by name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Link to="/stations/new" className="btn-primary">
          + New
        </Link>
          <button
            onClick={() => window.open("https://google.com", "_blank")}
            className="btn-primary"
          >
            PM DOCX
          </button>
          <button
            onClick={() => window.open("https://guarddog.omnisite.com/login", "_blank")}
            className="btn-primary"
          >
            Guarddog
          </button>
        <div className="text-slate-400 text-sm ml-auto">
          {data?.totalElements ?? 0} total
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap animate-pop">
        <table className="table table-sticky zebra">
          <thead>
            <tr>
              <th className="th">Code</th>
              <th className="th">Name</th>
              <th className="th">Comms</th>
              <th className="th">Pumps</th>
              <th className="th">Map</th>
              <th className="th">QR</th>
              <th className="th w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row: any) => {
              const id = String(row.id);
              const isDeleting = deletingId === id && delMutation.isPending;
              return (
                <tr key={id} className="tr-hover">
                  <td className="td">{row.code}</td>
                  <td className="td">
                    <Link className="link" to={`/stations/${id}`}>
                      {row.name}
                    </Link>
                  </td>
                  <td className="td">{row.commsType ?? "—"}</td>
                  <td className="td">{row.pumpsCount ?? "—"}</td>
                  <td className="td">
                    <MapPinButton station={toLiftStation(row)} />
                  </td>
                  <td className="td">
                    <Link
                      to={`/stations/${id}#qr`}
                      title="QR"
                      aria-label="Open QR"
                    >
                      📷
                    </Link>
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <Link to={`/stations/${id}/edit`} className="btn-muted btn-sm">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(id, row.code)}
                        disabled={isDeleting}
                        className="btn-danger btn-sm disabled:opacity-50"
                        title="Delete"
                        aria-label={`Delete station ${row.code ?? ""}`}
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td className="td text-slate-400" colSpan={7}>
                  No stations found. Try clearing the search or add a new station.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-between mt-4">
        <button
          className="btn-muted disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.set("page", String(Math.max(0, page - 1)));
            setSp(next);
          }}
          disabled={data?.first}
        >
          ← Prev
        </button>

        <div className="text-slate-300 text-sm">
          Page <span className="font-semibold text-slate-100">{page + 1}</span> /{" "}
          <span className="text-slate-400">{totalPages}</span>
        </div>

        <button
          className="btn-muted disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.set("page", String(page + 1));
            setSp(next);
          }}
          disabled={data?.last}
        >
          Next →
        </button>
      </div>

    </div>
  );
}
