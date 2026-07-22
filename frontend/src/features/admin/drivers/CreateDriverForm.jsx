import { useState } from 'react';
import { createDriverRequest } from '../adminService.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  licenseNumber: '',
  licenseExpiry: '',
};

export default function CreateDriverForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createDriverRequest(form);
      setSuccess('Driver account created successfully');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
      <div className="sr-card-title">Add Driver</div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Name</label>
            <input className="sr-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Email</label>
            <input className="sr-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Phone</label>
            <input className="sr-input" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Password</label>
            <input
              className="sr-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">License Number</label>
            <input className="sr-input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">License Expiry</label>
            <input
              className="sr-input"
              type="date"
              name="licenseExpiry"
              value={form.licenseExpiry}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Driver'}
        </button>
      </form>
    </div>
  );
}