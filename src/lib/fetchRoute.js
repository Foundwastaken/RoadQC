const KEYS = [
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY_2,
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
].filter(Boolean);

let googleReady = null;
let loadedKey = null;

function loadGoogleMaps(key) {
  if (googleReady && loadedKey === key) return googleReady;
  if (window.google?.maps?.DirectionsService) {
    googleReady = Promise.resolve();
    loadedKey = key;
    return googleReady;
  }

  googleReady = new Promise((resolve, reject) => {
    const cb = "__gmapsRouteReady";
    window[cb] = () => {
      delete window[cb];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${cb}&libraries=geometry`;
    script.async = true;
    script.onerror = () => {
      googleReady = null;
      reject(new Error("Failed to load Google Maps JS"));
    };
    document.head.appendChild(script);
  });
  loadedKey = key;
  return googleReady;
}

/**
 * Fetch the driving route between two points using Google Maps DirectionsService.
 * Tries multiple API keys. Returns { path, distanceKm, durationMin } or null.
 */
export async function fetchRoute(startLat, startLng, endLat, endLng) {
  if (KEYS.length === 0) {
    console.warn("No Google Maps API keys configured");
    return null;
  }

  for (const key of KEYS) {
    try {
      await loadGoogleMaps(key);

      const result = await new Promise((resolve, reject) => {
        const service = new window.google.maps.DirectionsService();
        service.route(
          {
            origin: { lat: startLat, lng: startLng },
            destination: { lat: endLat, lng: endLng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === "OK") resolve(response);
            else reject(new Error(`Directions API: ${status}`));
          }
        );
      });

      const route = result.routes[0];
      const leg = route.legs[0];

      const path = route.overview_path.map((p) => ({
        lat: p.lat(),
        lng: p.lng(),
      }));

      const distanceKm = Math.round((leg.distance.value / 1000) * 10) / 10;
      const durationMin = Math.round(leg.duration.value / 60);

      console.log(`Route fetched: ${distanceKm} km, ${durationMin} min (key: ...${key.slice(-6)})`);
      return { path, distanceKm, durationMin };
    } catch (err) {
      console.warn(`Route fetch failed with key ...${key.slice(-6)}:`, err.message);
      continue;
    }
  }

  console.error("All Google Maps API keys failed for Directions");
  return null;
}
