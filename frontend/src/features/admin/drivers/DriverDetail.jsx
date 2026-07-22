import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDriverById, verifyDriverRequest } from '../adminService.js';

const verificationColor = { pending: 'warning', in_review: 'info', approved: 'success', rejected: 'danger' };
const docStatusColor = { pending: 'muted', approved: 'success', rejected: 'danger' };

export default function DriverDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDriverById(id)
      .then((data) => {
        setDriver(data);
        setNextStatus(data.verificationStatus);
      })
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load driver'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await verifyDriverRequest(id, nextStatus);
      setSuccess('Verification status updated');
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update verification status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;
  if (!driver) return null;

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Driver Detail</h1>
      </div>
      
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      {success && <div className="sr-alert sr-alert-success">{success}</div>}

      <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-detail-grid" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div className="sr-detail-label">Name</div>
            <div className="sr-detail-value">{driver.user?.name}</div>
          </div>
          <div>
            <div className="sr-detail-label">Email</div>
            <div className="sr-detail-value">{driver.user?.email}</div>
          </div>
          <div>
            <div className="sr-detail-label">Phone</div>
            <div className="sr-detail-value">{driver.user?.phone}</div>
          </div>
          <div>
            <div className="sr-detail-label">License</div>
            <div className="sr-detail-value">
              {driver.licenseNumber} (expires {new Date(driver.licenseExpiry).toLocaleDateString()})
            </div>
          </div>
        </div>

        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-main)' }}>Current Status:</strong>{' '}
          <span className={`sr-badge sr-badge-${verificationColor[driver.verificationStatus]}`}>{driver.verificationStatus}</span>
        </p>

        <div className="sr-form-group" style={{ maxWidth: '300px', marginBottom: '1rem' }}>
          <label className="sr-label">Update Verification Status</label>
          <select className="sr-select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button className="sr-btn sr-btn-primary" onClick={handleVerify} disabled={submitting || nextStatus === driver.verificationStatus}>
          {submitting ? 'Updating...' : 'Update Status'}
        </button>
      </div>

      <div className="sr-card">
        <div className="sr-card-title">Documents</div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {driver.documents.map((d) => (
                <tr key={d._id}>
                  <td className="sr-capitalize">{d.type.replace('_', ' ')}</td>
                  <td>
                    <span className={`sr-badge sr-badge-${docStatusColor[d.status]}`}>{d.status}</span>
                  </td>
                  <td>
                    <a href={d.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {driver.documents.length === 0 && (
                <tr className="sr-table-empty">
                  <td colSpan={3}>
                    No documents uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}