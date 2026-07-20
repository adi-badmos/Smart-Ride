import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
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
      fetchRoutes().then(setRoutes).catch(() => {});
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

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Route</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="text-muted small">
          Rider: {subscription?.user?.name} — {subscription?.homeAddress?.address} →{' '}
          {subscription?.desiredDestination?.address}
        </p>

        <Form.Group className="mb-3">
          <Form.Label>Route</Form.Label>
          <Form.Select value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)}>
            <option value="">Select a route</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.city})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {occupancy && (
          <Alert variant={occupancy.currentOccupancy >= occupancy.capacity ? 'warning' : 'secondary'}>
            Occupancy: {occupancy.currentOccupancy} / {occupancy.capacity}
            {occupancy.currentOccupancy >= occupancy.capacity &&
              ' — this route is at or over capacity. You can still assign, but consider adding another route or vehicle.'}
          </Alert>
        )}

        {selectedRoute && (
          <Form.Group className="mb-3">
            <Form.Label>Pickup Point</Form.Label>
            <Form.Select
              value={selectedPickupPointId}
              onChange={(e) => setSelectedPickupPointId(e.target.value)}
            >
              <option value="">Select a pickup point</option>
              {selectedRoute.pickupPoints.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {p.address}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={submitting}>
          {submitting ? 'Assigning...' : 'Assign & Activate'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}