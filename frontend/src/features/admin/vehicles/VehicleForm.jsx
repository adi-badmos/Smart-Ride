import { useEffect, useState } from 'react';
import { createVehicleRequest } from './vehicleService.js';
import { fetchDrivers } from '../adminService.js';

const emptyForm = {
  registrationNumber: '',
  type: 'sedan',
  capacity: 4,
  make: '',
  model: '',
  year: new Date().getFullYear(),
  insuranceExpiry: '',
  driverProfile: '',
};

export default function VehicleForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers()
      .then(({ drivers }) => setDrivers(drivers))
      .catch(() => setDrivers([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createVehicleRequest({
        ...form,
        capacity: Number(form.capacity),
        year: Number(form.year),
        driverProfile: form.driverProfile || null,
      });
      setSuccess('Vehicle added successfully');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
      <div className="sr-card-title">Add Vehicle</div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Registration Number</label>
            <input
              className="sr-input"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Type</label>
            <select className="sr-select" name="type" value={form.type} onChange={handleChange}>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
            </select>
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Capacity</label>
            <input
              className="sr-input"
              type="number"
              name="capacity"
              min={1}
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Make</label>
            <input className="sr-input" name="make" value={form.make} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Model</label>
            <input className="sr-input" name="model" value={form.model} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Year</label>
            <input className="sr-input" type="number" name="year" value={form.year} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Insurance Expiry</label>
            <input
              className="sr-input"
              type="date"
              name="insuranceExpiry"
              value={form.insuranceExpiry}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Assign Driver (optional)</label>
            <select className="sr-select" name="driverProfile" value={form.driverProfile} onChange={handleChange}>
              <option value="">— Unassigned —</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} ({d.licenseNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}