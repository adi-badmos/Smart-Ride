import { useEffect, useRef, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { loadGoogleMaps } from '../utils/googleMapsLoader.js';

// Wraps a plain text input with Google Places Autocomplete. Reports back
// { address, coordinates: {lat, lng} } on selection — matching the shape
// every address field on the backend already expects (Subscription's
// homeAddress/desiredDestination, Route's pickupPoints/destination — all
// typed as { address, coordinates } since Phase 5/6). Falls back to a
// plain text input (still updating `address`, coordinates left null) if
// the Maps script fails to load — e.g. placeholder API key not yet real.
export default function AddressAutocomplete({ value, onChange, placeholder, required }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);

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
    if (!mapsReady || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return; // user hit Enter without picking a suggestion

      onChange({
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
      });
    });
  }, [mapsReady, onChange]);

  // Manual typing always keeps `address` in sync — coordinates only ever
  // come from an actual Places selection, never guessed from free text.
  const handleManualChange = (e) => {
    onChange({ address: e.target.value, coordinates: null });
  };

  return (
    <>
      <Form.Control
        ref={inputRef}
        value={value}
        onChange={handleManualChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {!mapsReady && !mapsFailed && (
        <Form.Text className="text-muted">
          <Spinner animation="border" size="sm" className="me-1" style={{ width: 12, height: 12 }} />
          Loading address suggestions...
        </Form.Text>
      )}
      {mapsFailed && (
        <Form.Text className="text-muted">
          Address suggestions unavailable — check your Google Maps API key. You can still type an address
          manually.
        </Form.Text>
      )}
    </>
  );
}