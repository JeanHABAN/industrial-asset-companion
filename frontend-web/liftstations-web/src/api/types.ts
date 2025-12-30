import { z } from "zod";

/* ---------- helpers ---------- */

// Coerce numeric IDs to strings if backend sends numbers
export const IdStr = z.preprocess(v => (typeof v === 'number' ? String(v) : v), z.string());

// Optional string: null/undefined/'' -> undefined; otherwise String(v)
export const OptStr = z
  .preprocess(v => (v === null || v === undefined || v === '' ? undefined : String(v)), z.string())
  .optional();

// Optional number: accepts "123" or 123; null/undefined/'' -> undefined
export const OptNum = z
  .preprocess(v => {
    if (v === null || v === undefined || v === '') return undefined;
    return typeof v === 'string' ? Number(v) : v;
  }, z.number())
  .optional();



/** Spring Page factory – pass a row schema, get a Page schema back */
export const SpringPage = <T extends z.ZodTypeAny>(Row: T) =>
  z.object({
    content: z.array(Row),
    totalPages: z.number(),
    totalElements: z.number().optional(),
    number: z.number().optional(), // current page index (0-based)
    size: z.number().optional(),
    first: z.boolean().optional(),
    last: z.boolean().optional(),
  });

  // ✅ TypeScript type alias for compile-time typing
export type SpringPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}; 


/** Alarm list row (schema VALUE) */
export const AlarmSchema = z.object({
  id: z.union([z.string(), z.number()]),
  stationId: z.union([z.string(), z.number()]).nullable().optional(),
  stationCode: z.string().nullable().optional(),
  stationName: z.string().nullable().optional(),

  name: z.string().nullable().optional(),     // alarm name/title
  type: z.string().nullable().optional(),
  severity: z.enum(["high", "medium", "low"]).or(z.string()).nullable().optional(),
  state: z.string().nullable().optional(),    // active/acknowledged/cleared
  openedAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
});

/** Alarm detail (schema VALUE) */
export const AlarmDetailSchema = AlarmSchema.extend({
  description: z.string().nullable().optional(),
  acknowledgedAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  acknowledgedBy: z.string().nullable().optional(),
  clearedAt: z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const LiftStationSummary = z.object({
  id: z.union([z.string(), z.number()]),
  code: z.string(),
  name: z.string(),
  commsType: z.string().nullable().optional(),
  pumpsCount: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
});

export type LiftStationSummary = z.infer<typeof LiftStationSummary>;

export const LiftStationView = LiftStationSummary.extend({
  googleMapsUrl: z.string().nullable().optional(),
  googleDirectionsUrl: z.string().nullable().optional(),
  appleMaps: z.string().nullable().optional(),            // pin (maps://)
  appleMapsDirections: z.string().nullable().optional(),  // maps://
  androidGeoUri: z.string().nullable().optional(),        // geo:
  notes: z.string().nullable().optional(),
  serviceArea: z.string().nullable().optional(),
  wetWellDepthFt: z.number().nullable().optional(),
  // …anything else you have on the detail…
});

/** Type aliases (TYPES only) */
export type LiftStationView = z.infer<typeof LiftStationView>;
export type Alarm = z.infer<typeof AlarmSchema>;
export type AlarmDetail = z.infer<typeof AlarmDetailSchema>;
