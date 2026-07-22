import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComplaintById } from './complaintService.js';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'muted' };

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaintById(id)
      .then(setComplaint)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );
  if (error) return <div className="sr-alert sr-alert-danger">{error}</div>;
  if (!complaint) return null;

  return (
    <div className="sr-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 className="sr-card-title m-0">{complaint.subject}</h3>
        <span className={`sr-badge sr-badge-${statusColor[complaint.status]}`}>
          {complaint.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="sr-text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {complaint.type} • {complaint.priority} priority • filed{' '}
        {new Date(complaint.createdAt).toLocaleDateString()}
      </p>
      
      <p style={{ marginBottom: '1.5rem' }}>{complaint.description}</p>

      {complaint.adminResponse && (
        <div className="sr-alert sr-alert-muted">
          <strong>Admin response:</strong>
          <br />
          {complaint.adminResponse}
        </div>
      )}
    </div>
  );
}