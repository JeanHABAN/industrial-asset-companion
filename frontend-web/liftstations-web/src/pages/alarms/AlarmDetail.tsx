// src/pages/alarms/AlarmDetail.tsx
import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAlarmDetail, ackAlarm, type AlarmDetailDto } from '../../api/alarms';

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-slate-400">{label}: </span>
      <span>{children}</span>
    </div>
  );
}

export default function AlarmDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError, error } = useQuery<AlarmDetailDto>({
    queryKey: ['alarm-detail', id],
    queryFn: () => fetchAlarmDetail(id!),
  });

  const [who, setWho] = useState('operator@example.com');

  const goBackSmart = () => {
    if (window.history.length > 1 && location.key !== 'default') navigate(-1);
    else navigate('/alarms');
  };

  const ackMut = useMutation({
    mutationFn: () => ackAlarm(id!, who),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['alarm-detail', id] }),
        qc.invalidateQueries({ queryKey: ['alarms'] }),
      ]);
      goBackSmart();
    },
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError || !data) {
    return <div className="text-rose-400">Error: {String((error as any)?.message || error)}</div>;
  }

  const a = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alarm Detail</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBackSmart}
            className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
          >
            Back
          </button>
          {a.stationId && (
            <Link to={`/stations/${a.stationId}`} className="px-3 py-2 rounded bg-slate-900 border border-slate-700">
              View Station
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: alarm fields + ack */}
        <div className="space-y-2">
          <Line label="Message">{a.message ?? '—'}</Line>
          <Line label="Severity">{a.severity ?? '—'}</Line>
          <Line label="Raised">{a.raisedAt ? new Date(a.raisedAt).toLocaleString() : '—'}</Line>
          <Line label="Acknowledged">
            {a.acknowledged ? <>Yes {a.acknowledgedBy ? `(${a.acknowledgedBy})` : ''}</> : 'No'}
          </Line>

          {!a.acknowledged && (
            <div className="flex items-center gap-2 pt-2">
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                placeholder="Your name or email"
                value={who}
                onChange={e => setWho(e.target.value)}
              />
              <button
                className="px-3 py-2 rounded bg-emerald-900 border border-emerald-700 disabled:opacity-50"
                onClick={() => ackMut.mutate()}
                disabled={ackMut.isPending || !who.trim()}
              >
                {ackMut.isPending ? 'Acknowledging…' : 'Acknowledge'}
              </button>
            </div>
          )}
        </div>

        {/* Right: recommended resources */}
        <div className="space-y-2">
          <h3 className="font-semibold">Recommended Resources</h3>
          {a.resources?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {a.resources.map((r, i) => (
                <li key={i}>
                  <div className="font-medium">
                    <a className="text-sky-400 hover:underline" href={r.url} target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  </div>
                  <div className="text-slate-300 text-sm">{r.description}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-400">No tips for this alarm.</div>
          )}
        </div>
      </div>
    </div>
  );
}
