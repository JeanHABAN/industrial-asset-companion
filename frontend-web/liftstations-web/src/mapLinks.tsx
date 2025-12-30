export function buildMapLinks(name: string, lat: number, lng: number) {
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
