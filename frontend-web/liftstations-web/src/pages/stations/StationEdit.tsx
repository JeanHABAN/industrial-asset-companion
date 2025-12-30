// src/pages/stations/StationEdit.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStation, updateStation } from '../../api/stations';

/* ----------------------------- form value type ---------------------------- */
type FormValues = {
  code: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string; // 2 letters
  zip: string;

  latitude: number;
  longitude: number;

  serviceArea: string;
  wetWellDepthFt: number;
  pumpsCount: number;
  commsType: 'cellular' | 'radio' | 'ethernet' | 'other';
  notes: string;

  googleMaps: string;          // http(s)
  googleDirections: string;    // http(s)
  appleMapsPin: string;        // maps://
  appleMapsDirections: string; // maps://
  androidGeoUri: string;       // geo:
};

/* ----------------------- helpers for map link generation ------------------ */
function buildMapLinks(name: string, lat: number, lng: number) {
  const latS = Number(lat).toFixed(6);
  const lngS = Number(lng).toFixed(6);
  const qName = encodeURIComponent(name || 'Lift Station');
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${latS},${lngS}`,
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${latS},${lngS}`,
    appleMapsPin: `maps://?q=${qName}&ll=${latS},${lngS}`,
    appleMapsDirections: `maps://?daddr=${latS},${lngS}&q=${qName}`,
    androidGeoUri: `geo:${latS},${lngS}?q=${latS},${lngS}(${qName})`,
  };
}

/* ---------------------------- input UX helpers ---------------------------- */
const allowIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const k = e.key;
  if (e.ctrlKey || e.metaKey) return;
  if (
    k === 'Backspace' || k === 'Delete' || k === 'Tab' || k === 'Enter' ||
    k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End' ||
    k === 'Escape' || k === 'Insert'
  ) return;
  if (!/^[0-9]$/.test(k)) e.preventDefault();
};

const allowDecimalKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const k = e.key;
  if (e.ctrlKey || e.metaKey) return;
  if (
    k === 'Backspace' || k === 'Delete' || k === 'Tab' || k === 'Enter' ||
    k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End' ||
    k === 'Escape' || k === 'Insert'
  ) return;

  if (/^[a-zA-Z+]$/.test(k)) { e.preventDefault(); return; } // block e/E/+ etc

  const el = e.currentTarget;
  const val = el.value;
  const selStart = el.selectionStart ?? val.length;
  const selEnd = el.selectionEnd ?? val.length;

  if (k === '.') {
    const already = val.includes('.');
    const dotIdx = val.indexOf('.');
    const dotSelected = already && dotIdx >= selStart && dotIdx < selEnd;
    if (already && !dotSelected) { e.preventDefault(); return; }
    return;
  }
  if (k === '-') {
    const hasMinus = val.startsWith('-');
    const minusSelected = hasMinus && selStart === 0 && selEnd > 0;
    if (selStart !== 0 || (hasMinus && !minusSelected)) { e.preventDefault(); return; }
    return;
  }
  if (!/^[0-9]$/.test(k)) e.preventDefault();
};

const normalizePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
  const el = e.currentTarget; // text input supports selection API
  const raw = e.clipboardData.getData('text');
  const normalized = raw.replace(',', '.').replace(/[^\d.\-]/g, '');
  e.preventDefault();

  const start = el.selectionStart ?? el.value.length;
  const end   = el.selectionEnd ?? el.value.length;

  el.setRangeText(normalized, start, end, 'end');
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

/* --------------------------------- page ---------------------------------- */
export default function StationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [generateOnBlur, setGenerateOnBlur] = useState(true);
  const linkTouched = useRef({ gm:false, gd:false, ap:false, ad:false, geo:false });

  const { data: station, isLoading, isError, error } = useQuery({
    queryKey: ['station', id],
    queryFn: () => fetchStation(id!),
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange', reValidateMode: 'onChange' });

  // Prefill fields from backend and autofill missing links once.
  useEffect(() => {
    if (!station) return;

    setValue('code', station.code ?? '');
    setValue('name', station.name ?? '');
    setValue('addressLine1', (station as any).address ?? (station as any).addressLine1 ?? '');
    setValue('city', (station as any).city ?? '');
    setValue('state', (station as any).state ?? '');
    setValue('zip', (station as any).zip ?? '');

    setValue('latitude', station.latitude as any);
    setValue('longitude', station.longitude as any);

    setValue('serviceArea', (station as any).serviceArea ?? '');
    setValue('wetWellDepthFt', (station as any).wetWellDepthFt as any);
    setValue('pumpsCount', (station as any).pumpsCount as any);
    setValue('commsType', (station as any).commsType ?? 'cellular');
    setValue('notes', (station as any).notes ?? '');

    // accept both older & newer property names
    const googleMapsExisting =
      (station as any).googleMapsUrl ?? (station as any).googleMaps ?? '';
    const googleDirsExisting =
      (station as any).googleDirectionsUrl ?? (station as any).googleDirections ?? '';
    const applePinExisting =
      (station as any).appleMaps ?? (station as any).appleMapsPin ?? '';
    const appleDirExisting =
      (station as any).appleMapsDirections ?? '';
    const geoExisting =
      (station as any).androidGeoUri ?? '';

    setValue('googleMaps', googleMapsExisting);
    setValue('googleDirections', googleDirsExisting);
    setValue('appleMapsPin', applePinExisting);
    setValue('appleMapsDirections', appleDirExisting);
    setValue('androidGeoUri', geoExisting);

    // If missing, generate once using name/lat/lng
    const lat = Number(station.latitude);
    const lng = Number(station.longitude);
    const coordsOK = Number.isFinite(lat) && Number.isFinite(lng);
    if (coordsOK) {
      const L = buildMapLinks(station.name ?? 'Lift Station', lat, lng);
      if (!googleMapsExisting)      setValue('googleMaps', L.googleMaps, { shouldDirty: true });
      if (!googleDirsExisting)      setValue('googleDirections', L.googleDirections, { shouldDirty: true });
      if (!applePinExisting)        setValue('appleMapsPin', L.appleMapsPin, { shouldDirty: true });
      if (!appleDirExisting)        setValue('appleMapsDirections', L.appleMapsDirections, { shouldDirty: true });
      if (!geoExisting)             setValue('androidGeoUri', L.androidGeoUri, { shouldDirty: true });
    }
  }, [station, setValue]);

  // Generate links when leaving Name/Lat/Lng, unless the user already edited those fields.
  const tryGenerateLinks = () => {
    if (!generateOnBlur) return;
    const name = (getValues('name') || '').toString().trim();
    const lat = Number(getValues('latitude'));
    const lng = Number(getValues('longitude'));
    const coordsValid =
      Number.isFinite(lat) && Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    if (!name || !coordsValid) return;

    const L = buildMapLinks(name, lat, lng);
    if (!linkTouched.current.gm) setValue('googleMaps', L.googleMaps, { shouldValidate: true, shouldDirty: true });
    if (!linkTouched.current.gd) setValue('googleDirections', L.googleDirections, { shouldValidate: true, shouldDirty: true });
    if (!linkTouched.current.ap) setValue('appleMapsPin', L.appleMapsPin, { shouldValidate: true, shouldDirty: true });
    if (!linkTouched.current.ad) setValue('appleMapsDirections', L.appleMapsDirections, { shouldValidate: true, shouldDirty: true });
    if (!linkTouched.current.geo) setValue('androidGeoUri', L.androidGeoUri, { shouldValidate: true, shouldDirty: true });
  };

  const mutation = useMutation({
    mutationFn: (body: FormValues) => updateStation(id!, body),
    onSuccess: async (updated: any) => {
      await qc.invalidateQueries({ queryKey: ['stations'] });
      await qc.invalidateQueries({ queryKey: ['station', id] });
      sessionStorage.setItem('toast', JSON.stringify({ type: 'success', text: 'Station updated' }));
      navigate(`/stations/${updated.id}`);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to update station';
      const fe = err?.fieldErrors;
      if (fe && typeof fe === 'object') {
        Object.entries(fe).forEach(([field, message]) => {
          // @ts-ignore – dynamic field from server
          setError(field, { type: 'server', message: String(message) });
        });
      } else {
        alert(msg);
      }
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  /* -------------------- small Field wrapper (like create page) ------------- */
  const Field = ({
    label,
    name,
    type = 'text',
    requiredMsg = 'Required',
    onBlurCompose,
    ...rest
  }: {
    label: string;
    name: keyof FormValues;
    type?: string;
    requiredMsg?: string;
    onBlurCompose?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const reg = register(name as any, { required: requiredMsg });
    return (
      <label className="flex flex-col gap-1">
        <span className="text-slate-300">
          {label} <span className="text-rose-400">*</span>
        </span>
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
          type={type}
          aria-invalid={!!errors[name]}
          {...reg}
          onBlur={(e) => { reg.onBlur(e as any); onBlurCompose?.(e); }}
          {...rest}
          required
        />
        {errors[name] && <span className="text-rose-400 text-sm">{(errors[name] as any)?.message}</span>}
      </label>
    );
  };

  // validations mirroring create page
  const stateReg = register('state', {
    required: 'Required',
    minLength: { value: 2, message: 'Use 2-letter code' },
    maxLength: { value: 2, message: 'Use 2-letter code' },
    pattern: { value: /^[A-Za-z]{2}$/, message: 'Letters only' },
    setValueAs: v => (typeof v === 'string' ? v.toUpperCase().slice(0, 2) : v),
  });
  const latReg = register('latitude', {
    required: 'Required',
    setValueAs: v => (v === '' || v == null ? NaN : Number(v)),
    min: { value: -90, message: '>= -90' },
    max: { value: 90, message: '<= 90' },
  });
  const lngReg = register('longitude', {
    required: 'Required',
    setValueAs: v => (v === '' || v == null ? NaN : Number(v)),
    min: { value: -180, message: '>= -180' },
    max: { value: 180, message: '<= 180' },
  });
  const wetReg = register('wetWellDepthFt', {
    required: 'Required',
    setValueAs: v => (v === '' || v == null ? NaN : Number(v)),
    min: { value: 0.000001, message: '> 0' },
  });
  const pumpsReg = register('pumpsCount', {
    required: 'Required',
    setValueAs: v => {
      if (v === '' || v == null) return NaN;
      const n = Math.trunc(Number(v));
      return Number.isFinite(n) ? n : NaN;
    },
    min: { value: 1, message: '>= 1' },
    validate: v => Number.isInteger(v) || 'Whole number',
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError)   return <div className="text-rose-400">Error: {String((error as any)?.message || error)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Edit Lift Station</h2>
        <div className="flex gap-2">
          <Link to={`/stations/${id}`} className="px-3 py-2 rounded bg-slate-900 border border-slate-700">Back</Link>
        </div>
      </div>

      <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* LEFT */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code" name="code" onBlurCompose={tryGenerateLinks} />
            <Field label="Name" name="name" onBlurCompose={tryGenerateLinks} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Address" name="addressLine1" />
            <Field label="City" name="city" />
            {/* State */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">State (2 letters) <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                maxLength={2}
                {...stateReg}
                required
              />
              {errors.state && <span className="text-rose-400 text-sm">{errors.state.message as string}</span>}
            </label>
            {/* ZIP */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">ZIP <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                {...register('zip', {
                  required: 'Required',
                  pattern: { value: /^\d{5}(-\d{4})?$/, message: '12345 or 12345-6789' },
                })}
                required
              />
              {errors.zip && <span className="text-rose-400 text-sm">{errors.zip.message as string}</span>}
            </label>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-3 gap-3">
            {/* Latitude */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Latitude <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                type="text"
                inputMode="decimal"
                {...latReg}
                onKeyDown={allowDecimalKeys}
                onPaste={(ev) => { normalizePaste(ev); setTimeout(tryGenerateLinks, 0); }}
                onBlur={(e) => { latReg.onBlur(e); tryGenerateLinks(); }}
                required
              />
              {errors.latitude && <span className="text-rose-400 text-sm">{errors.latitude.message as string}</span>}
            </label>

            {/* Longitude */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Longitude <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                type="text"
                inputMode="decimal"
                {...lngReg}
                onKeyDown={allowDecimalKeys}
                onPaste={(ev) => { normalizePaste(ev); setTimeout(tryGenerateLinks, 0); }}
                onBlur={(e) => { lngReg.onBlur(e); tryGenerateLinks(); }}
                required
              />
              {errors.longitude && <span className="text-rose-400 text-sm">{errors.longitude.message as string}</span>}
            </label>

            {/* Comms */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Comms Type <span className="text-rose-400">*</span></span>
              <select
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                {...register('commsType', { required: 'Required' })}
                required
              >
                <option value="cellular">cellular</option>
                <option value="radio">radio</option>
                <option value="ethernet">ethernet</option>
                <option value="other">other</option>
              </select>
              {errors.commsType && <span className="text-rose-400 text-sm">{errors.commsType.message as string}</span>}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Wet well / pumps / area */}
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Wet Well Depth (ft) <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                type="number"
                inputMode="decimal"
                step="0.01"
                {...wetReg}
                onKeyDown={allowDecimalKeys}
                required
              />
              {errors.wetWellDepthFt && <span className="text-rose-400 text-sm">{errors.wetWellDepthFt.message as string}</span>}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Pumps Count <span className="text-rose-400">*</span></span>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
                type="number"
                inputMode="numeric"
                step="1"
                {...pumpsReg}
                onKeyDown={allowIntegerKeys}
                required
              />
              {errors.pumpsCount && <span className="text-rose-400 text-sm">{errors.pumpsCount.message as string}</span>}
            </label>

            <Field label="Service Area" name="serviceArea" />
          </div>

          {/* Notes */}
          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Notes <span className="text-rose-400">*</span></span>
            <textarea
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700 min-h-28"
              {...register('notes', { required: 'Required' })}
              required
            />
            {errors.notes && <span className="text-rose-400 text-sm">{errors.notes.message as string}</span>}
          </label>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Map / Links</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={generateOnBlur}
                onChange={(e) => setGenerateOnBlur(e.target.checked)}
              />
              Generate on blur (Name/Lat/Lng)
            </label>
          </div>

          {/* Google URLs */}
          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Google Maps URL <span className="text-rose-400">*</span></span>
            <input
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
              {...register('googleMaps', {
                required: 'Required',
                pattern: { value: /^https?:\/\/.+/i, message: 'Must start with http(s)://' },
                onChange: () => (linkTouched.current.gm = true),
              } as any)}
              required
            />
            {errors.googleMaps && <span className="text-rose-400 text-sm">{errors.googleMaps.message as string}</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Google Directions URL <span className="text-rose-400">*</span></span>
            <input
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700"
              {...register('googleDirections', {
                required: 'Required',
                pattern: { value: /^https?:\/\/.+/i, message: 'Must start with http(s)://' },
                onChange: () => (linkTouched.current.gd = true),
              } as any)}
              required
            />
            {errors.googleDirections && <span className="text-rose-400 text-sm">{errors.googleDirections.message as string}</span>}
          </label>

          {/* Apple / Android (custom schemes allowed) */}
          <Field
            label="Apple Maps Pin (maps://)"
            name="appleMapsPin"
            onBlurCompose={() => (linkTouched.current.ap = true)}
          />
          <Field
            label="Apple Maps Directions (maps://)"
            name="appleMapsDirections"
            onBlurCompose={() => (linkTouched.current.ad = true)}
          />
          <Field
            label="Android geo URI (geo:)"
            name="androidGeoUri"
            onBlurCompose={() => (linkTouched.current.geo = true)}
          />
        </div>

        {/* Bottom actions */}
        <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-800 mt-2">
          <Link
            to={`/stations/${id}`}
            className="px-4 py-2 rounded bg-slate-900 border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-sky-700 border border-sky-800 text-white disabled:opacity-50"
            disabled={!isValid || isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
