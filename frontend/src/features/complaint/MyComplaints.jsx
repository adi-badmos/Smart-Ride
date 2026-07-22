import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyComplaints } from './complaintService.js';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'muted' };

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyComplaints()
      .then(setComplaints)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  return (
    <>
      <div className="sr-page-header">
        <h4 className="sr-page-title">My Complaints</h4>
        <Link to="/complaints/new" className="sr-btn sr-btn-primary">
          + New Complaint
        </Link>
      </div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Filed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.subject}</td>
                <td className="sr-capitalize">{c.type}</td>
                <td className="sr-capitalize">{c.priority}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[c.status]}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/complaints/${c._id}`} className="sr-btn sr-btn-outline sr-btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={6}>No complaints filed yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}