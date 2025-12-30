// src/pages/stations/StationDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStation, deleteStation } from '../../api/stations';
import StationAlarms from './StationAlarms';

type StationView = Awaited<ReturnType<typeof fetchStation>>;

/* ---------------------------- tiny toast system --------------------------- */
type Toast = { id: number; type: 'success' | 'error' | 'info'; text: string };
function Toasts({ toasts, onClose }: { toasts: Toast[]; onClose: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <div
          key={t.id}
          className={
            'min-w-[260px] max-w-[360px] px-3 py-2 rounded shadow-lg border ' +
            (t.type === 'success'
              ? 'bg-emerald-900/70 border-emerald-700 text-emerald-50'
              : t.type === 'error'
                ? 'bg-rose-900/70 border-rose-800 text-rose-50'
                : 'bg-slate-800/80 border-slate-700 text-slate-100')
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
/* ------------------------------------------------------------------------- */

function fmt(v: unknown, decimals?: number) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number' && Number.isFinite(v)) {
    return typeof decimals === 'number' ? v.toFixed(decimals) : String(v);
  }
  return String(v);
}

export default function StationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<StationView>({
    queryKey: ['station', id],
    queryFn: () => fetchStation(id!),
  });

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);
  const showToast = (type: Toast['type'], text: string) => {
    const nid = nextId;
    setNextId(nid + 1);
    setToasts(ts => [...ts, { id: nid, type, text }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== nid)), 3000);
  };
  const closeToast = (idN: number) => setToasts(ts => ts.filter(t => t.id !== idN));

  // Pull a toast from sessionStorage (set by Create/Edit) and show it once.
  useEffect(() => {
    const raw = sessionStorage.getItem('toast');
    if (!raw) return;
    sessionStorage.removeItem('toast');
    try {
      const { type, text } = JSON.parse(raw);
      showToast(type ?? 'info', text ?? 'Done');
    } catch {
      /* ignore */
    }
  }, []);

  // If the URL has #qr, scroll to the QR section on load
  useEffect(() => {
    if (location.hash === '#qr') {
      document.getElementById('qr')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    if (!id) return;
    const ok = window.confirm('Delete this lift station? This action cannot be undone.');
    if (!ok) return;
    try {
      setDeleting(true);
      await deleteStation(id);
      // Put toast for the list page
      sessionStorage.setItem('toast', JSON.stringify({ type: 'success', text: 'Station deleted' }));
      navigate('/stations');
    } catch (e: any) {
      console.error('Delete failed:', e);
      showToast('error', e?.message || 'Failed to delete station');
    } finally {
      setDeleting(false);
    }
  }
  function handleEdit() {
    if (!id) return;
    navigate(`/stations/${id}/edit`);
  }

  if (isLoading) return <div>Loading…</div>;
  if (isError || !data) {
    return <div className="text-rose-400">Failed to load: {String((error as any)?.message ?? 'Unknown error')}</div>;
  }

  // Address: support either `addressLine1` or legacy `address`
  const addr1 =
    (data as any).addressLine1 ??
    (data as any).address ??
    '';
  const city = (data as any).city ?? '';
  const state = (data as any).state ?? '';
  const zip = (data as any).zip ?? '';
  const addr2 = [city, state, zip].filter(Boolean).join(' ').trim() || null;

  // Map links: support both shapes
  const googleMaps = (data as any).googleMapsUrl ?? (data as any).googleMaps ?? null;
  const googleDirections = (data as any).googleDirectionsUrl ?? (data as any).googleDirections ?? null;
  const applePin = (data as any).appleMaps ?? (data as any).appleMapsPin ?? null;
  const appleDir = (data as any).appleMapsDirections ?? null;
  const androidGeo = (data as any).androidGeoUri ?? null;

  return (
    <div className="space-y-4">
      {/* toasts */}
      <Toasts toasts={toasts} onClose={closeToast} />

      {/* Top toolbar */}
      <div className="flex items-center justify-between gap-3 sticky top-0 z-10 bg-slate-950/70 backdrop-blur px-1 py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/stations" className="btn-muted">
            ← Back
          </Link>
          <h2 className="text-lg md:text-xl font-semibold">
            {data.name} <span className="text-slate-400">({data.code})</span>
          </h2>
        </div>

        <div className="flex gap-2 shrink-0">
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
          <button onClick={handleEdit} className="btn-primary" title="Edit station">
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete station"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-3">
          <div className="card">
            <div className="card-header">Location</div>
            <div className="card-body text-slate-300 space-y-1">
              {(addr1 || addr2) ? (
                <>
                  {addr1 && <div>{addr1}</div>}
                  {addr2 && <div>{addr2}</div>}
                </>
              ) : (
                <div className="text-slate-500">No address on file</div>
              )}
              <div>Lat/Lng: {fmt(data.latitude, 6)}, {fmt(data.longitude, 6)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Map Links</div>
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                {googleMaps && (
                  <a className="btn-muted" href={googleMaps} target="_blank" rel="noopener noreferrer">
                    Google Maps
                  </a>
                )}
                {googleDirections && (
                  <a className="btn-muted" href={googleDirections} target="_blank" rel="noopener noreferrer">
                    Google Directions
                  </a>
                )}
                {applePin && (
                  <a className="btn-muted" href={applePin} target="_blank" rel="noopener noreferrer">
                    Apple Maps
                  </a>
                )}
                {appleDir && (
                  <a className="btn-muted" href={appleDir} target="_blank" rel="noopener noreferrer">
                    Apple Directions
                  </a>
                )}
                {androidGeo && (
                  <a className="btn-muted" href={androidGeo}>
                    Android Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* QR + Print */}
          <div className="card" id="qr">
            <div className="card-header">Station QR</div>
            <div className="card-body">
              <div className="flex gap-4 items-center">
                <img
                  src={`${import.meta.env.VITE_API_BASE}/stations/${id}/qr/android`}
                  width={120}
                  height={120}
                  alt="Android QR"
                />
                <img
                  src={`${import.meta.env.VITE_API_BASE}/stations/${id}/qr/ios`}
                  width={120}
                  height={120}
                  alt="iOS QR"
                />
                <a
                  className="btn-muted"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${import.meta.env.VITE_API_BASE}/stations/${id}/qr/label`}
                >
                  Print Label
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SCADA + Alarms */}
        <div className="space-y-3">
          <div className="card">
            <div className="card-header">SCADA (latest)</div>
            <div className="card-body">
              <pre className="bg-slate-900 p-3 rounded border border-slate-800 text-xs overflow-auto">
                {JSON.stringify({ wetWellLevelFt: 11.2, pump1Running: true, pump2Running: false, flowGpm: 320 }, null, 2)}
              </pre>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Alarms</div>
            <div className="card-body">
              {id && <StationAlarms stationId={id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
