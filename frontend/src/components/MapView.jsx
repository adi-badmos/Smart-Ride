import { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { loadGoogleMaps } from '../utils/googleMapsLoader.js';

// Real route visualization. Falls back to the old plain-list rendering
// whenever coordinates aren't available yet — either because Maps failed
// to load, or because these are Tier 1 records that only ever captured
// plain-text addresses (coordinates null until re-saved through the
// now-live autocomplete). No crash either way, just a graceful downgrade.
export default function MapView({ pickupPoints = [], destinationAddress = '', destinationCoordinates = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);

  const pointsWithCoords = pickupPoints.filter((p) => p.coordinates?.lat && p.coordinates?.lng);
  const hasDestinationCoords = destinationCoordinates?.lat && destinationCoordinates?.lng;
  const hasAnyCoords = pointsWithCoords.length > 0 || hasDestinationCoords;

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (!cancelled) setMapsReady(true);
      })
      .catch(() => {
        if (!cancelled) setMapsFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !hasAnyCoords) return;

    const bounds = new window.google.maps.LatLngBounds();
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    pointsWithCoords.forEach((p, i) => {
      const position = { lat: p.coordinates.lat, lng: p.coordinates.lng };
      new window.google.maps.Marker({
        position,
        map,
        label: String(i + 1),
        title: p.name,
      });
      bounds.extend(position);
    });

    if (hasDestinationCoords) {
      const destPosition = { lat: destinationCoordinates.lat, lng: destinationCoordinates.lng };
      new window.google.maps.Marker({
        position: destPosition,
        map,
        title: 'Destination',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
      bounds.extend(destPosition);
    }

    map.fitBounds(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, hasAnyCoords, JSON.stringify(pointsWithCoords), JSON.stringify(destinationCoordinates)]);

  if (mapsFailed || (!hasAnyCoords && mapsReady)) {
    // Same fallback rendering Phase 5 always showed — used both when Maps
    // genuinely fails, and when the record just has no coordinates yet.
    return (
      <div className="border rounded p-3 bg-light">
        <p className="text-muted small mb-2">
          {mapsFailed
            ? 'Map unavailable — check your Google Maps API key.'
            : 'No coordinates saved for this route yet — re-save it using the address autocomplete to populate the map.'}
        </p>
        <ol className="mb-2">
          {pickupPoints.map((p, i) => (
            <li key={p._id || i}>
              {p.name} — {p.address}
            </li>
          ))}
        </ol>
        {destinationAddress && (
          <p className="mb-0">
            <strong>Destination:</strong> {destinationAddress}
          </p>
        )}
      </div>
    );
  }

  if (!mapsReady) {
    return (
      <div className="border rounded p-3 bg-light text-center">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return <div ref={mapRef} style={{ height: 300, borderRadius: 8 }} />;
}