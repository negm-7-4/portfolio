/**
 * One cinematic destination per project — where the camera flies on the
 * globe, and the lighting mood it arrives to. Pure data (no three.js
 * imports) so the HTML layer can read names/coordinates without pulling
 * the 3D chunk.
 *
 * `sun` is the sun's direction relative to the viewer, in degrees:
 *   az  — azimuth around the globe (0 = behind the camera → fully lit
 *         face, ±90 = side-lit terminator, ±120+ = night side w/ city
 *         lights and a thin crescent)
 *   el  — elevation above the equator plane
 *
 * Order matches `projects` in src/data/content.js.
 */
export const destinations = [
  {
    // SAMS — San Francisco, the AI capital. Bright confident midday.
    name: "San Francisco, USA",
    lat: 37.7749,
    lng: -122.4194,
    sun: { az: -70, el: 30 },
  },
  {
    // Vera — Paris, the perfume capital. Warm golden afternoon.
    name: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    sun: { az: -38, el: 24 },
  },
  {
    // Nexora ERP — home base. Warm morning light over the Nile delta.
    name: "Cairo, Egypt",
    lat: 30.0444,
    lng: 31.2357,
    sun: { az: -38, el: 16 },
  },
  {
    // AutomationHub — Singapore, the connected hub. Clean equatorial light.
    name: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    sun: { az: 12, el: 44 },
  },
  {
    // Acoustic Room Mapper — Sydney riding the dawn terminator.
    name: "Sydney, Australia",
    lat: -33.8688,
    lng: 151.2093,
    sun: { az: 72, el: -2 },
  },
  {
    // Social Network Analyzer — Tokyo at night: a living network of light.
    name: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
    sun: { az: 108, el: 6 },
  },
  {
    // BASCALSCALAR — Zürich, precision country. Clean midday alpine light.
    name: "Zürich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    sun: { az: 8, el: 42 },
  },
  {
    // To Do List App — New York, late golden afternoon.
    name: "New York, USA",
    lat: 40.7128,
    lng: -74.006,
    sun: { az: -62, el: 22 },
  },
];

/** "30.04° N · 31.24° E" — HUD coordinate readout. */
export function formatCoords(lat, lng) {
  const la = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lo = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? "E" : "W"}`;
  return `${la} · ${lo}`;
}
