// src/lib/mapLinks.ts
export function fmt(n: number) { return n.toFixed(6); }

export function googleMaps(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${fmt(lat)},${fmt(lng)}`;
}
export function googleDirections(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${fmt(lat)},${fmt(lng)}`;
}

// iOS deep link + fallback
export function appleMapsDirections(lat: number, lng: number, name = "Lift Station") {
  const q = encodeURIComponent(name);
  return {
    app: `maps://?daddr=${fmt(lat)},${fmt(lng)}&q=${q}`,
    web: `https://maps.apple.com/?daddr=${fmt(lat)},${fmt(lng)}&q=${q}`,
  };
}

// Android deep link + fallback
export function androidGeo(lat: number, lng: number, name = "Lift Station") {
  const q = encodeURIComponent(name);
  return {
    app: `geo:${fmt(lat)},${fmt(lng)}?q=${fmt(lat)},${fmt(lng)}(${q})`,
    web: googleDirections(lat, lng),
  };
}
