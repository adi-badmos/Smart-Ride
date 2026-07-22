import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMySubscriptions } from './subscriptionService.js';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'muted',
  CANCELLED: 'danger',
};

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMySubscriptions()
      .then(setSubscriptions)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load subscriptions'))
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
        <h4 className="sr-page-title">My Subscriptions</h4>
        <Link to="/subscriptions/new" className="sr-btn sr-btn-primary">
          + New Subscription
        </Link>
      </div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Route</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s._id}>
                <td>{s.plan?.name}</td>
                <td>{s.route?.name || '—'}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[s.status]}`}>{s.status}</span>
                </td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/subscriptions/${s._id}`} className="sr-btn sr-btn-outline sr-btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={5}>No subscriptions yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}