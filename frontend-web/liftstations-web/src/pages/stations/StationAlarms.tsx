// src/pages/stations/StationAlarms.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchAlarms } from '../../api/alarms';
import { severityRank } from './severityOrder';

type AlarmDto = Awaited<ReturnType<typeof fetchAlarms>>['content'][number];

function SevPill({ sev }: { sev?: string | null }) {
  const s = (sev ?? '').toLowerCase();
  const cls =
    s === 'critical' || s === 'high'
      ? 'bg-rose-700/30 text-rose-200'
      : s === 'warning' || s === 'medium'
      ? 'bg-amber-700/30 text-amber-200'
      : 'bg-slate-700/40 text-slate-200';
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{sev ?? '—'}</span>;
}

export default function StationAlarms({ stationId }: { stationId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['alarms', 'station', stationId, { size: 500 }],
    queryFn: () => fetchAlarms({ stationId, page: 0, size: 500 }), // grab “all” practical
    staleTime: 30_000,
  });

  if (isLoading) return <div>Loading alarms…</div>;
  if (isError)   return <div className="text-rose-400">Failed: {String((error as any)?.message || error)}</div>;

  const rows = [...(data?.content ?? [])].sort((a: AlarmDto, b: AlarmDto) => {
    const r = severityRank(a.severity) - severityRank(b.severity);
    if (r !== 0) return r;
    const atA = a.raisedAt ? new Date(a.raisedAt).getTime() : 0;
    const atB = b.raisedAt ? new Date(b.raisedAt).getTime() : 0;
    return atB - atA; // newest first
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">All alarms (severity → newest)</h3>
        <div className="text-slate-400 text-sm">{rows.length} total</div>
      </div>

      <div className="border border-slate-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left p-2">Severity</th>
              <th className="text-left p-2">Message</th>
              <th className="text-left p-2">Opened</th>
              <th className="text-left p-2">Ack</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id} className="border-t border-slate-800">
                <td className="p-2"><SevPill sev={a.severity} /></td>
                <td className="p-2">{a.message ?? '—'}</td>
                <td className="p-2">{a.raisedAt ? new Date(a.raisedAt).toLocaleString() : '—'}</td>
                <td className="p-2">{a.acknowledged ? '✓' : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-slate-400">No alarms for this station.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
