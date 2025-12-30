import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchAlarms, ackAlarm } from "../../api/alarms";
import type { Alarm } from "../../api/types";
import { toast } from "react-hot-toast";

export default function AlarmsList() {
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();

  const page = Math.max(0, Number(sp.get("page") ?? 0));
  const q = sp.get("q") ?? "";

  // debounce search box
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);
  useEffect(() => {
  const t = setTimeout(() => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);

      // Sync q
      if (searchInput) next.set("q", searchInput);
      else next.delete("q");

      // Only reset page if q actually changed
      const oldQ = prev.get("q") ?? "";
      if (oldQ !== searchInput) {
        next.set("page", "0");
      }

      return next;
    });
  }, 300);

  return () => clearTimeout(t);
}, [searchInput, setSp]);
  // data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["alarms", { q, page }],
    queryFn: () => fetchAlarms({ q, page, size: 50 }),
    placeholderData: keepPreviousData,
  });

  const items: Alarm[] = useMemo(() => data?.content ?? [], [data?.content]);
  const totalPages = data?.totalPages ?? 1;

  // acknowledge
  const currentUser = "web"; // TODO: replace with real user if you have auth
  const { mutate: doAck, isPending: acking } = useMutation({
    mutationFn: (id: string | number) => ackAlarm(String(id), currentUser),
    onSuccess: () => {
      toast.success("Alarm acknowledged");
      qc.invalidateQueries({ queryKey: ["alarms"] });
    },
    onError: (e: any) => toast.error(`Ack failed: ${e?.message || "unknown error"}`),
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError)
    return (
      <div style={{ color: "tomato" }}>
        Error: {String((error as any)?.message || error)}
      </div>
    );

  const sevClass = (sev?: Alarm["severity"]) => {
    const s = String(sev ?? "").toLowerCase();
    if (s === "high" || s === "critical") return "bg-rose-700/30 text-rose-200";
    if (s === "medium" || s === "moderate") return "bg-amber-700/30 text-amber-200";
    return "bg-slate-700/40 text-slate-200";
  };

  const canAck = (a: Alarm) => {
    const state = String(a.state ?? "").toLowerCase();
    return state !== "acknowledged" && state !== "cleared";
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <input
          className="w-72 px-3 py-2 rounded bg-slate-900 text-slate-100
                     placeholder:text-slate-400 border border-slate-700
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-slate-600"
          placeholder="Search alarms"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left p-2">Station</th>
              <th className="text-left p-2">Alarm</th>
              <th className="text-left p-2">Severity</th>
              <th className="text-left p-2">State</th>
              <th className="text-left p-2">Opened</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr
                key={String(a.id)}
                className="border-t border-slate-800 hover:bg-slate-900/60"
              >
                <td className="p-2">
                  {a.stationId ? (
                    <Link
                      className="text-sky-400 hover:underline"
                      to={`/stations/${a.stationId}`}
                    >
                      {a.stationCode ?? a.stationName ?? "Station"}
                    </Link>
                  ) : (
                    a.stationCode ?? a.stationName ?? "—"
                  )}
                </td>

                <td className="p-2">{a.name ?? a.type ?? "—"}</td>

                <td className="p-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${sevClass(a.severity)}`}>
                    {a.severity ?? "—"}
                  </span>
                </td>

                <td className="p-2">{a.state ?? "—"}</td>

                <td className="p-2">
                  {a.openedAt ? new Date(a.openedAt as any).toLocaleString() : "—"}
                </td>

                <td className="p-2">
                  <div className="flex gap-2">
                    <Link className="text-sky-400 hover:underline" to={`/alarms/${a.id}`}>
                      view
                    </Link>

                    {canAck(a) && (
                      <button
                        onClick={() => doAck(a.id!)}
                        disabled={acking}
                        className="inline-flex h-8 items-center justify-center rounded-md px-3
                                   bg-slate-800 text-slate-50 hover:bg-slate-700 active:bg-slate-900
                                   border border-slate-600
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                                   focus-visible:ring-sky-400 ring-offset-slate-950
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Acknowledge alarm"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-between">
        <button
          className="inline-flex h-10 items-center justify-center rounded-xl px-4
                     bg-slate-800 text-slate-50 hover:bg-slate-700 active:bg-slate-900
                     border border-slate-600
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                     focus-visible:ring-sky-400 ring-offset-slate-950
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.set("page", String(Math.max(0, page - 1)));
            setSp(next);
          }}
          disabled={data?.first}
        >
          Prev
        </button>

        <div>Page {page + 1} / {totalPages}</div>

        <button
          className="inline-flex h-10 items-center justify-center rounded-xl px-4
                     bg-slate-800 text-slate-50 hover:bg-slate-700 active:bg-slate-900
                     border border-slate-600
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                     focus-visible:ring-sky-400 ring-offset-slate-950
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.set("page", String(page + 1));
            setSp(next);
          }}
          disabled={data?.last}
        >
          Next
        </button>
      </div>
    </div>
  );
}
