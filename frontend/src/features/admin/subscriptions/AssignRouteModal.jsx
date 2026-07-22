import { useEffect, useState } from 'react';
import { fetchRoutes, fetchRouteOccupancy } from '../routes/routeService.js';
import { assignRouteRequest } from './subscriptionAdminService.js';

export default function AssignRouteModal({ subscription, show, onClose, onAssigned }) {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedPickupPointId, setSelectedPickupPointId] = useState('');
  const [occupancy, setOccupancy] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      fetchRoutes({ limit: 100 })
        .then(({ routes }) => setRoutes(routes))
        .catch(() => {});
      setSelectedRouteId('');
      setSelectedPickupPointId('');
      setOccupancy(null);
      setError('');
    }
  }, [show]);

  useEffect(() => {
    if (selectedRouteId) {
      fetchRouteOccupancy(selectedRouteId).then(setOccupancy).catch(() => setOccupancy(null));
      setSelectedPickupPointId('');
    }
  }, [selectedRouteId]);

  const selectedRoute = routes.find((r) => r._id === selectedRouteId);

  const handleAssign = async () => {
    setError('');
    if (!selectedRouteId || !selectedPickupPointId) {
      setError('Select a route and pickup point');
      return;
    }
    setSubmitting(true);
    try {
      await assignRouteRequest(subscription._id, {
        routeId: selectedRouteId,
        pickupPointId: selectedPickupPointId,
      });
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to assign route');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="sr-card" style={{ width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="sr-card-title">Assign Route</div>
        
        {error && <div className="sr-alert sr-alert-danger">{error}</div>}
        
        <p className="sr-text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Rider: {subscription?.user?.name} — {subscription?.homeAddress?.address} →{' '}
          {subscription?.desiredDestination?.address}
        </p>

        <div className="sr-form-group">
          <label className="sr-label">Route</label>
          <select className="sr-select" value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)}>
            <option value="">Select a route</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </div>

        {occupancy && (
          <div className={`sr-alert sr-alert-${occupancy.currentOccupancy >= occupancy.capacity ? 'warning' : 'muted'}`} style={{ marginBottom: '1rem' }}>
            Occupancy: {occupancy.currentOccupancy} / {occupancy.capacity}
            {occupancy.currentOccupancy >= occupancy.capacity &&
              ' — this route is at or over capacity. You can still assign, but consider adding another route or vehicle.'}
          </div>
        )}

        {selectedRoute && (
          <div className="sr-form-group">
            <label className="sr-label">Pickup Point</label>
            <select
              className="sr-select"
              value={selectedPickupPointId}
              onChange={(e) => setSelectedPickupPointId(e.target.value)}
            >
              <option value="">Select a pickup point</option>
              {selectedRoute.pickupPoints.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {p.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
          <button className="sr-btn sr-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="sr-btn sr-btn-primary" onClick={handleAssign} disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign & Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}