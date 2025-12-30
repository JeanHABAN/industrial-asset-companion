export function formatVal(v: number) {
  const av = Math.abs(v);
  if (av >= 1000) return v.toFixed(0);
  if (av >= 100)  return v.toFixed(1);
  if (av >= 10)   return v.toFixed(2);
  return v.toFixed(3);
}