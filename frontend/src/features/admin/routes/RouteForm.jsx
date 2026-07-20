import { useEffect, useState } from 'react';
import { Form, Button, Alert, Row, Col, Card, ButtonGroup } from 'react-bootstrap';
import { createRouteRequest, updateRouteRequest } from './routeService.js';
import { fetchDrivers } from '../adminService.js';
import { fetchVehicles } from '../vehicles/vehicleService.js';
import AddressAutocomplete from '../../../components/AddressAutocomplete.jsx';
import MapView from '../../../components/MapView.jsx';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const emptyPickupPoint = () => ({ name: '', address: '', coordinates: null, order: 0 });

const emptyForm = {
  name: '',
  city: '',
  pickupPoints: [emptyPickupPoint()],
  destination: { address: '', coordinates: null },
  schedule: { departureTime: '', arrivalTime: '', operatingDays: [] },
  capacity: 10,
  driver: '',
  vehicle: '',
};

export default function RouteForm({ initialRoute, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers().then(setDrivers).catch(() => {});
    fetchVehicles().then(setVehicles).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialRoute) {
      setForm({
        name: initialRoute.name,
        city: initialRoute.city,
        pickupPoints: initialRoute.pickupPoints.map((p) => ({ ...p })),
        destination: { address: initialRoute.destination.address, coordinates: initialRoute.destination.coordinates },
        schedule: { ...initialRoute.schedule },
        capacity: initialRoute.capacity,
        driver: initialRoute.driver?._id || '',
        vehicle: initialRoute.vehicle?._id || '',
      });
    }
  }, [initialRoute]);

  const updatePickupPointField = (index, field, value) => {
    const updated = [...form.pickupPoints];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, pickupPoints: updated });
  };

  const updatePickupPointAddress = (index, { address, coordinates }) => {
    const updated = [...form.pickupPoints];
    updated[index] = { ...updated[index], address, coordinates };
    setForm({ ...form, pickupPoints: updated });
  };

  const addPickupPoint = () => {
    setForm({
      ...form,
      pickupPoints: [...form.pickupPoints, { ...emptyPickupPoint(), order: form.pickupPoints.length }],
    });
  };

  const removePickupPoint = (index) => {
    const updated = form.pickupPoints.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i }));
    setForm({ ...form, pickupPoints: updated });
  };

  const movePickupPoint = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= form.pickupPoints.length) return;
    const updated = [...form.pickupPoints];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setForm({ ...form, pickupPoints: updated.map((p, i) => ({ ...p, order: i })) });
  };

  const toggleDay = (day) => {
    const days = form.schedule.operatingDays.includes(day)
      ? form.schedule.operatingDays.filter((d) => d !== day)
      : [...form.schedule.operatingDays, day];
    setForm({ ...form, schedule: { ...form.schedule, operatingDays: days } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        driver: form.driver || undefined,
        vehicle: form.vehicle || undefined,
      };
      if (initialRoute) {
        await updateRouteRequest(initialRoute._id, payload);
        setSuccess('Route updated successfully');
      } else {
        await createRouteRequest(payload);
        setSuccess('Route created successfully');
        setForm(emptyForm);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{initialRoute ? 'Edit Route' : 'Create Route'}</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Label>Route Name</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Col>
            <Col md={6}>
              <Form.Label>City</Form.Label>
              <Form.Control value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </Col>
          </Row>

          <Form.Label>Pickup Points</Form.Label>
          {form.pickupPoints.map((p, i) => (
            <Row className="g-2 mb-2 align-items-start" key={p._id || i}>
              <Col md={3}>
                <Form.Control
                  placeholder="Name"
                  value={p.name}
                  onChange={(e) => updatePickupPointField(i, 'name', e.target.value)}
                  required
                />
              </Col>
              <Col md={6}>
                <AddressAutocomplete
                  value={p.address}
                  onChange={(val) => updatePickupPointAddress(i, val)}
                  placeholder="Address"
                  required
                />
              </Col>
              <Col md={3}>
                <ButtonGroup size="sm" className="w-100">
                  <Button variant="outline-secondary" onClick={() => movePickupPoint(i, -1)} disabled={i === 0}>
                    ↑
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => movePickupPoint(i, 1)}
                    disabled={i === form.pickupPoints.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => removePickupPoint(i)}
                    disabled={form.pickupPoints.length === 1}
                  >
                    Remove
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          ))}
          <Button variant="outline-primary" size="sm" onClick={addPickupPoint} className="mb-3">
            + Add Pickup Point
          </Button>

          <Form.Group className="mb-3">
            <Form.Label>Destination Address</Form.Label>
            <AddressAutocomplete
              value={form.destination.address}
              onChange={(val) => setForm({ ...form, destination: val })}
              required
            />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Label>Departure Time</Form.Label>
              <Form.Control
                type="time"
                value={form.schedule.departureTime}
                onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, departureTime: e.target.value } })}
                required
              />
            </Col>
            <Col md={4}>
              <Form.Label>Arrival Time</Form.Label>
              <Form.Control
                type="time"
                value={form.schedule.arrivalTime}
                onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, arrivalTime: e.target.value } })}
                required
              />
            </Col>
            <Col md={4}>
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">Operating Days</Form.Label>
            {DAYS.map((day) => (
              <Form.Check
                key={day}
                inline
                type="checkbox"
                label={day.toUpperCase()}
                checked={form.schedule.operatingDays.includes(day)}
                onChange={() => toggleDay(day)}
              />
            ))}
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Label>Driver</Form.Label>
              <Form.Select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.user?.email})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Vehicle</Form.Label>
              <Form.Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                <option value="">Unassigned</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} ({v.type})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <MapView
            pickupPoints={form.pickupPoints}
            destinationAddress={form.destination.address}
            destinationCoordinates={form.destination.coordinates}
          />

          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? 'Saving...' : initialRoute ? 'Update Route' : 'Create Route'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}