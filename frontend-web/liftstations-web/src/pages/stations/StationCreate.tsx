// src/pages/stations/StationCreate.tsx
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStation } from '../../api/stations';

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

  googleMaps: string;
  googleDirections: string;
  appleMapsPin: string;
  appleMapsDirections: string;
  androidGeoUri: string;
};

/** Build map links locally (no extra deps) */
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

/** ---------- DMS / mixed-text coordinate parsing helpers ---------- **/

// Parse ONE coordinate in either decimal (with optional hemisphere) or DMS.
function parseOneCoord(input: string): number | null {
  const s = input.trim();

  // Decimal with optional hemisphere (N/S/E/W)
  const dec = s.match(/^(-?\d+(?:\.\d+)?)(?:\s*([NSEW]))?$/i);
  if (dec) {
    let v = parseFloat(dec[1]);
    const hemi = (dec[2] || '').toUpperCase();
    if (hemi === 'S' || hemi === 'W') v = -Math.abs(v);
    if (hemi === 'N' || hemi === 'E') v = Math.abs(v);
    return Number.isFinite(v) ? v : null;
  }

  // DMS like 30°17'53.5"N
  const dms = s.match(
    /(\d{1,3})\s*[°\s]\s*(\d{1,2})\s*['\s]\s*([\d.]+)\s*(?:["”]?)\s*([NSEW])/i
  );
  if (dms) {
    const deg = parseFloat(dms[1]);
    const min = parseFloat(dms[2]);
    const sec = parseFloat(dms[3]);
    const hemi = dms[4].toUpperCase();
    if ([deg, min, sec].some(n => !Number.isFinite(n))) return null;
    let v = deg + min / 60 + sec / 3600;
    if (hemi === 'S' || hemi === 'W') v = -Math.abs(v);
    return v;
  }

  return null;
}

// Extract BOTH coordinates (lat & lng) from any text blob.
// Works for "30°17'53.5\"N 97°47'15.2\"W", "30.2982, -97.7876", etc.
function extractLatLngFromText(text: string): { lat: number; lng: number } | null {
  const cleaned = text
    .replace(/[;,]|(\s{2,})/g, ' ')
    .replace(/[,]+/g, ' ')
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);

  // Try adjacent pairs first
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = parseOneCoord(tokens[i]);
    const b = parseOneCoord(tokens[i + 1]);
    if (a != null && b != null) {
      const latFirst = Math.abs(a) <= 90 && Math.abs(b) <= 180;
      const lngFirst = Math.abs(b) <= 90 && Math.abs(a) <= 180;
      if (latFirst) return { lat: a, lng: b };
      if (lngFirst) return { lat: b, lng: a };
    }
  }

  // Fallback: scan all tokens for two usable numbers
  const nums = tokens.map(t => parseOneCoord(t)).filter((v): v is number => v != null);
  if (nums.length >= 2) {
    const latIdx = nums.findIndex(v => Math.abs(v) <= 90);
    if (latIdx >= 0) {
      const rest = nums.filter((_, i) => i !== latIdx);
      const lng =
        rest.find(v => Math.abs(v) > 90 && Math.abs(v) <= 180) ?? rest[0];
      if (lng != null) return { lat: nums[latIdx], lng };
    }
  }

  return null;
}

/** Integer key filter; allow OS/browser shortcuts */
const allowIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const k = e.key;
  if (e.ctrlKey || e.metaKey) return; // allow Ctrl/Cmd+C/V/A/…
  if (
    k === 'Backspace' || k === 'Delete' || k === 'Tab' || k === 'Enter' ||
    k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End' ||
    k === 'Escape' || k === 'Insert'
  ) return;
  if (!/^[0-9]$/.test(k)) e.preventDefault();
};

/** Decimal key filter; one dot & optional leading minus; keep shortcuts */
const allowDecimalKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const k = e.key;
  if (e.ctrlKey || e.metaKey) return;
  if (
    k === 'Backspace' || k === 'Delete' || k === 'Tab' || k === 'Enter' ||
    k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End' ||
    k === 'Escape' || k === 'Insert'
  ) return;

  // Block letters (e/E exponents), plus '+'
  if (/^[a-zA-Z+]$/.test(k)) { e.preventDefault(); return; }

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

/** Robust paste normalizer for text inputs (caret-safe) */
const normalizePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
  const el = e.currentTarget; // text input supports selection API
  const raw = e.clipboardData.getData('text');
  const normalized = raw.replace(',', '.').replace(/[^\d.\-]/g, '');
  e.preventDefault();

  const start = el.selectionStart ?? el.value.length;
  const end   = el.selectionEnd ?? el.value.length;

  el.setRangeText(normalized, start, end, 'end');           // paste at caret
  el.dispatchEvent(new Event('input', { bubbles: true }));  // notify RHF
};

export default function StationCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [generateOnBlur, setGenerateOnBlur] = useState(true);

  // Track if user manually edited link fields—don’t overwrite those.
  const linkTouched = useRef({ gm:false, gd:false, ap:false, ad:false, geo:false });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    getValues,
    setError,
  } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { commsType: 'cellular' } as any,
    shouldFocusError: true,
  });

  /** Generate links when leaving Name/Lat/Lng */
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

  /** Paste handler that understands DMS + both-in-one strings */
  const onPasteCoords =
    (which: 'lat' | 'lng'): React.ClipboardEventHandler<HTMLInputElement> =>
    (e) => {
      const raw = e.clipboardData.getData('text');

      // Try both coords
      const both = extractLatLngFromText(raw);
      if (both) {
        e.preventDefault();
        setValue('latitude',  both.lat, { shouldValidate: true, shouldDirty: true });
        setValue('longitude', both.lng, { shouldValidate: true, shouldDirty: true });
        setTimeout(tryGenerateLinks, 0);
        return;
      }

      // Try single coord
      const one = parseOneCoord(raw);
      if (one != null) {
        e.preventDefault();
        if (which === 'lat') {
          setValue('latitude', one, { shouldValidate: true, shouldDirty: true });
        } else {
          setValue('longitude', one, { shouldValidate: true, shouldDirty: true });
        }
        setTimeout(tryGenerateLinks, 0);
        return;
      }

      // Fallback to numeric normalizer
      normalizePaste(e);
      setTimeout(tryGenerateLinks, 0);
    };

  /** POST to backend and navigate to the created station */
  const mutation = useMutation({
    mutationFn: (body: FormValues) => createStation(body),
    onSuccess: async (created: any) => {
      await qc.invalidateQueries({ queryKey: ['stations'] });
      navigate(`/stations/${created.id}`);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to create station';
      const fe = err?.fieldErrors;
      if (fe && typeof fe === 'object') {
        Object.entries(fe).forEach(([field, message]) => {
          // @ts-ignore - field comes from server
          setError(field, { type: 'server', message: String(message) });
        });
      } else {
        alert(msg);
      }
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  /** Reusable input that composes RHF's onBlur with our own */
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
        <span className="text-slate-300">{label} <span className="text-rose-400">*</span></span>
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

  // Pre-registered fields needing extra handlers
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">New Lift Station</h2>
        <div className="flex gap-2">
          <Link to="/stations" className="px-3 py-2 rounded bg-slate-900 border border-slate-700">Back</Link>
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
                onPaste={onPasteCoords('lat')}
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
                onPaste={onPasteCoords('lng')}
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

        {/* Bottom action bar */}
        <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-800 mt-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-slate-900 border border-slate-700"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-emerald-900 border border-emerald-700 disabled:opacity-50"
            disabled={!isValid || isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Create Station'}
          </button>
        </div>
      </form>
    </div>
  );
}
