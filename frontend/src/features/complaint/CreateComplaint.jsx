import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaintRequest } from './complaintService.js';

const TYPES = ['service', 'driver', 'route', 'payment', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', description: '', type: 'service', priority: 'medium' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const complaint = await createComplaintRequest(form);
      navigate(`/complaints/${complaint._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h4 className="sr-page-title">File a Complaint</h4>
      <div className="sr-card">
        {error && <div className="sr-alert sr-alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="sr-form-group">
            <label className="sr-label">Subject</label>
            <input className="sr-input" name="subject" value={form.subject} onChange={handleChange} required />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Description</label>
            <textarea
              className="sr-textarea"
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Type</label>
            <select className="sr-select" name="type" value={form.type} onChange={handleChange}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Priority</label>
            <select className="sr-select" name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </>
  );
}