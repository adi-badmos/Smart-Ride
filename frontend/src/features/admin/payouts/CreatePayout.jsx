import { useEffect, useState } from 'react';
import { fetchDrivers } from '../adminService.js';
import { createPayoutRequest } from './payoutAdminService.js';

const emptyForm = { driverProfileId: '', amount: '', startDate: '', endDate: '' };

export default function CreatePayout({ onCreated }) {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers({ limit: 100 })
      .then(({ drivers }) => setDrivers(drivers))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createPayoutRequest({
        driverProfileId: form.driverProfileId,
        amount: Number(form.amount),
        period: { startDate: form.startDate, endDate: form.endDate },
      });
      setSuccess('Payout created');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create payout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
      <div className="sr-card-title">Create Payout</div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Driver</label>
            <select className="sr-select" name="driverProfileId" value={form.driverProfileId} onChange={handleChange} required>
              <option value="">Select a driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} ({d.user?.email})
                </option>
              ))}
            </select>
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Amount (₹)</label>
            <input
              className="sr-input"
              type="number"
              min={0}
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Period Start</label>
            <input
              className="sr-input"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Period End</label>
            <input 
              className="sr-input" 
              type="date" 
              name="endDate" 
              value={form.endDate} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Payout'}
        </button>
      </form>
    </div>
  );
}