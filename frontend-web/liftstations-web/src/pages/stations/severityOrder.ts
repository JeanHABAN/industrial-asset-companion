// src/pages/stations/severityOrder.ts
export function severityRank(sev?: string | null) {
  const s = (sev ?? '').toLowerCase();
  if (['critical', 'high', 'hh', 'urgent'].includes(s)) return 0;
  if (['warning', 'medium', 'moderate'].includes(s)) return 1;
  if (['info', 'low', 'notice'].includes(s)) return 2;
  return 3; // unknown at the end
}
