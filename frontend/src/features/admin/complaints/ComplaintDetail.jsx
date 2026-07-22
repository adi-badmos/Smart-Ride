import { useState } from 'react';
import { updateComplaintRequest } from './complaintAdminService.js';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'muted' };

export default function ComplaintDetail({ complaint, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [adminResponse, setAdminResponse] = useState(complaint.adminResponse || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setError('');
    setSubmitting(true);
    try {
      await updateComplaintRequest(complaint._id, { status, adminResponse });
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="sr-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="sr-card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {complaint.subject}
            <span className={`sr-badge sr-badge-${statusColor[complaint.status]}`}>{complaint.status.replace('_', ' ')}</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="sr-alert sr-alert-danger">{error}</div>}

        <p className="sr-text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          Filed by {complaint.user?.name} ({complaint.user?.email}) — <span className="sr-capitalize">{complaint.type}</span>, <span className="sr-capitalize">{complaint.priority}</span> priority
        </p>
        
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          {complaint.description}
        </div>

        <div className="sr-form-group">
          <label className="sr-label">Status</label>
          <select className="sr-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="sr-form-group">
          <label className="sr-label">Admin Response</label>
          <textarea
            className="sr-textarea"
            rows={4}
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
          <button className="sr-btn sr-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="sr-btn sr-btn-primary" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}