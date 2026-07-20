// Loads the Google Maps JS API (Places + core) exactly once, however many
// components need it. Multiple components mounting AddressAutocomplete or
// MapView simultaneously all await the same promise instead of injecting
// duplicate <script> tags.
let loaderPromise = null;

export const loadGoogleMaps = () => {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve(window.google.maps);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps — check VITE_GOOGLE_MAPS_API_KEY'));
    document.head.appendChild(script);
  });

  return loaderPromise;
};