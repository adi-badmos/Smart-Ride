import { useEffect, useState } from 'react';
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
    fetchDrivers({ limit: 100 })
      .then(({ drivers }) => setDrivers(drivers))
      .catch(() => {});
    fetchVehicles({ limit: 100 })
      .then(({ vehicles }) => setVehicles(vehicles))
      .catch(() => {});
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
    <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
      <div className="sr-card-title">{initialRoute ? 'Edit Route' : 'Create Route'}</div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Route Name</label>
            <input className="sr-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">City</label>
            <input className="sr-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="sr-label">Pickup Points</label>
          {form.pickupPoints.map((p, i) => (
            <div key={p._id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 120px', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'start' }}>
              <input
                className="sr-input"
                placeholder="Name"
                value={p.name}
                onChange={(e) => updatePickupPointField(i, 'name', e.target.value)}
                required
              />
              <div style={{ minWidth: 0 }}>
                <AddressAutocomplete
                  value={p.address}
                  onChange={(val) => updatePickupPointAddress(i, val)}
                  placeholder="Address"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => movePickupPoint(i, -1)} disabled={i === 0} style={{ padding: '0.25rem 0.5rem' }}>
                  ↑
                </button>
                <button type="button" className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => movePickupPoint(i, 1)} disabled={i === form.pickupPoints.length - 1} style={{ padding: '0.25rem 0.5rem' }}>
                  ↓
                </button>
                <button type="button" className="sr-btn sr-btn-sm sr-btn-danger" onClick={() => removePickupPoint(i)} disabled={form.pickupPoints.length === 1} style={{ padding: '0.25rem 0.5rem' }}>
                  ×
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="sr-btn sr-btn-sm sr-btn-outline" onClick={addPickupPoint}>
            + Add Pickup Point
          </button>
        </div>

        <div className="sr-form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="sr-label">Destination Address</label>
          <AddressAutocomplete
            value={form.destination.address}
            onChange={(val) => setForm({ ...form, destination: val })}
            required
          />
        </div>

        <div className="sr-row sr-col-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Departure Time</label>
            <input
              className="sr-input"
              type="time"
              value={form.schedule.departureTime}
              onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, departureTime: e.target.value } })}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Arrival Time</label>
            <input
              className="sr-input"
              type="time"
              value={form.schedule.arrivalTime}
              onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, arrivalTime: e.target.value } })}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Capacity</label>
            <input
              className="sr-input"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="sr-form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="sr-label">Operating Days</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {DAYS.map((day) => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={form.schedule.operatingDays.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                {day.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Driver</label>
            <select className="sr-select" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
              <option value="">Unassigned</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} ({d.user?.email})
                </option>
              ))}
            </select>
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Vehicle</label>
            <select className="sr-select" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
              <option value="">Unassigned</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} ({v.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden' }}>
          <MapView
            pickupPoints={form.pickupPoints}
            destinationAddress={form.destination.address}
            destinationCoordinates={form.destination.coordinates}
          />
        </div>

        <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : initialRoute ? 'Update Route' : 'Create Route'}
        </button>
      </form>
    </div>
  );
}