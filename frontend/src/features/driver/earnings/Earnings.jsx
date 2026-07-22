import { useEffect, useState } from 'react';
import { fetchMyPayouts } from './payoutService.js';

const statusColor = { pending: 'warning', processed: 'info', paid: 'success', failed: 'danger' };

export default function Earnings() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPayouts()
      .then(setPayouts)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load payouts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <h4 className="sr-page-title">My Earnings</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      
      <div className="sr-card sr-stat" style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
        <div className="sr-stat-label">Total paid to date</div>
        <div className="sr-stat-value">₹{totalPaid}</div>
      </div>
      
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction Ref</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p._id}>
                <td>
                  {new Date(p.period.startDate).toLocaleDateString()} –{' '}
                  {new Date(p.period.endDate).toLocaleDateString()}
                </td>
                <td>₹{p.amount}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[p.status]}`}>{p.status}</span>
                </td>
                <td>{p.transactionRef || '—'}</td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={4}>No payouts yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}