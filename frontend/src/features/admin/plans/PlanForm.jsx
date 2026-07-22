import { useEffect, useState } from 'react';
import { createPlanRequest, updatePlanRequest } from './planAdminService.js';

const emptyForm = { name: '', description: '', duration: 30, price: 0, features: '', isActive: true };

export default function PlanForm({ initialPlan, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setForm({
        name: initialPlan.name,
        description: initialPlan.description || '',
        duration: initialPlan.duration,
        price: initialPlan.price,
        features: (initialPlan.features || []).join(', '),
        isActive: initialPlan.isActive,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialPlan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        duration: Number(form.duration),
        price: Number(form.price),
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };
      if (initialPlan) {
        await updatePlanRequest(initialPlan._id, payload);
        setSuccess('Plan updated');
      } else {
        await createPlanRequest(payload);
        setSuccess('Plan created');
        setForm(emptyForm);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
      <div className="sr-card-title">{initialPlan ? 'Edit Plan' : 'Create Plan'}</div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="sr-row sr-col-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="sr-form-group">
            <label className="sr-label">Name</label>
            <input className="sr-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Description</label>
            <input className="sr-input" name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Duration (days)</label>
            <input
              className="sr-input"
              type="number"
              min={1}
              name="duration"
              value={form.duration}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Price (₹)</label>
            <input
              className="sr-input"
              type="number"
              min={0}
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="sr-form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <label className="sr-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
          <div className="sr-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="sr-label">Features (comma-separated)</label>
            <input className="sr-input" name="features" value={form.features} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : initialPlan ? 'Update Plan' : 'Create Plan'}
          </button>
          {initialPlan && (
            <button type="button" className="sr-btn sr-btn-outline" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}