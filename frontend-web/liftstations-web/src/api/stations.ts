import { http } from './http';
import { SpringPage, LiftStationSummary, LiftStationView } from './types';

const PageStationSummary = SpringPage(LiftStationSummary);

/* -------- helpers -------- */

function normalizeStation(raw: any) {
  return {
    ...raw,

    // field name differences (accept both, prefer normalized names)
    addressLine1: raw.addressLine1 ?? raw.address ?? null,

    latitude: raw.latitude ?? raw.lat ?? null,
    longitude: raw.longitude ?? raw.lng ?? raw.long ?? null,

    // Google links
    googleMaps: raw.googleMaps ?? raw.googleMapUrl ?? raw.googleMapsUrl ?? null,
    googleDirections: raw.googleDirections ?? raw.googleDirectionsUrl ?? null,

    // Apple links: support either pin/directions or a single appleMaps
    appleMapsPin: raw.appleMapsPin ?? raw.appleMaps ?? null,
    appleMapsDirections: raw.appleMapsDirections ?? raw.appleDirections ?? null,

    // Android
    androidGeoUri: raw.androidGeoUri ?? raw.geo ?? null,
  };
}

// Remove undefined so Zod doesn’t see “present but undefined”
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/* -------- list (Spring page) -------- */

export async function fetchStationSummaries(params: { q?: string; page?: number; size?: number }) {
  const { data } = await http.get('/stations/summary', { params });
  try {
    return PageStationSummary.parse(data);
  } catch (e: any) {
    console.error('Zod error (stations/summary):', e?.issues ?? e, '\nGot payload:', data);
    throw e;
  }
}

/* -------- detail -------- */

export async function fetchStation(id: string) {
  const { data } = await http.get(`/stations/${id}`);
  const clean = stripUndefined(normalizeStation(data));
  try {
    return LiftStationView.parse(clean);
  } catch (e: any) {
    console.error('Zod error (station detail):', e?.issues ?? e, '\nGot payload:', clean);
    throw e;
  }
}

/* -------- commands -------- */

export async function createStation(body: any) {
  try {
    const { data } = await http.post('/stations', body);
    const clean = stripUndefined(normalizeStation(data));
    return LiftStationView.parse(clean);
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Failed to create station';
    const fieldErrors = err?.response?.data?.fieldErrors;
    const e: any = new Error(msg);
    if (fieldErrors) e.fieldErrors = fieldErrors; // surfaces “code already in use”, etc.
    throw e;
  }
}

export async function updateStation(id: string, body: any) {
  const { data } = await http.put(`/stations/${id}`, body);
  const clean = stripUndefined(normalizeStation(data));
  return LiftStationView.parse(clean);
}

export async function deleteStation(id: string) {
  await http.delete(`/stations/${id}`);
}
