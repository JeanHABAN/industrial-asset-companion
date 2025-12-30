// lib/api/stations.ts
import axios from "axios";
import { API_BASE } from "./base";

/** Server page shape (Spring Data style) */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number;
};

/** What the app wants to use everywhere */
export type StationSummary = {
  id: string;
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  pumpsCount: number;
  commsType: string;
};

export type StationView = {
  id: string;
  code: string;
  name: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude: number | null;
  longitude: number | null;
  serviceArea?: string;
  wetWellDepthFt?: number;
  pumpsCount?: number;
  commsType?: string;
  notes?: string;

  // map links (optional — we’ll build them if absent)
  googleMaps?: string;
  googleDirections?: string;
  appleMapsPin?: string;
  appleMapsDirections?: string;
  androidGeoUri?: string;
};

/** Possible shapes from your API (flexible to avoid runtime surprises) */
type StationApi = {
  id?: string | number;
  code?: string;
  name?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;

  latitude?: number | string | null;
  longitude?: number | string | null;

  // alt coordinate shapes we often see
  lat?: number | string | null;
  lng?: number | string | null;
  location?: { lat?: number | string | null; lng?: number | string | null } | null;

  serviceArea?: string;
  wetWellDepthFt?: number | string;
  pumpsCount?: number | string;
  commsType?: string;
  notes?: string;

  // optional prebuilt links
  googleMaps?: string;
  googleDirections?: string;
  appleMapsPin?: string;
  appleMapsDirections?: string;
  androidGeoUri?: string;
};

function num(x: unknown): number | null {
  const n = typeof x === "string" ? Number(x) : (x as number);
  return Number.isFinite(n as number) ? (n as number) : null;
}

function buildMapLinks(name: string, lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return {};
  const label = encodeURIComponent(name || "Location");
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    googleDirections: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
    appleMapsPin: `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
    appleMapsDirections: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
    androidGeoUri: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
  };
}

function toView(raw: StationApi): StationView {
  // normalize coords from any of the common fields
  const latitude =
    num(raw.latitude) ?? num(raw.lat) ?? num(raw.location?.lat) ?? null;
  const longitude =
    num(raw.longitude) ?? num(raw.lng) ?? num(raw.location?.lng) ?? null;

  const base: StationView = {
    id: String(raw.id ?? ""),
    code: String(raw.code ?? ""),
    name: String(raw.name ?? "Station"),
    addressLine1: raw.addressLine1,
    city: raw.city,
    state: raw.state,
    zip: raw.zip,
    latitude,
    longitude,
    serviceArea: raw.serviceArea,
    wetWellDepthFt: num(raw.wetWellDepthFt) ?? undefined,
    pumpsCount: num(raw.pumpsCount) ?? undefined,
    commsType: raw.commsType,
    notes: raw.notes,

    // pass through server-provided links if they exist
    googleMaps: raw.googleMaps,
    googleDirections: raw.googleDirections,
    appleMapsPin: raw.appleMapsPin,
    appleMapsDirections: raw.appleMapsDirections,
    androidGeoUri: raw.androidGeoUri,
  };

  // Fill in any missing links from coords
  return { ...buildMapLinks(base.name, base.latitude, base.longitude), ...base };
}

function toSummary(raw: StationApi): StationSummary {
  const latitude =
    num(raw.latitude) ?? num(raw.lat) ?? num(raw.location?.lat) ?? null;
  const longitude =
    num(raw.longitude) ?? num(raw.lng) ?? num(raw.location?.lng) ?? null;

  return {
    id: String(raw.id ?? ""),
    code: String(raw.code ?? ""),
    name: String(raw.name ?? "Station"),
    latitude,
    longitude,
    pumpsCount: (num(raw.pumpsCount) ?? 0),
    commsType: String(raw.commsType ?? ""),
  };
}

/** List paged stations with normalization */
export async function fetchStations(
  page = 0,
  size = 50,
  q?: string
): Promise<Page<StationSummary>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (q && q.trim()) params.set("q", q.trim());

  const { data } = await axios.get<Page<StationApi>>(
    `${API_BASE}/stations?${params.toString()}`
  );

  return {
    ...data,
    content: data.content.map(toSummary),
  };
}

/** One station, normalized */
export async function fetchStation(id: string): Promise<StationView> {
  const { data } = await axios.get<StationApi>(`${API_BASE}/stations/${id}`);
  return toView(data);
}
