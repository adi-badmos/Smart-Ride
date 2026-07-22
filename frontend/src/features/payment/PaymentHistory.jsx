import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyPayments } from './paymentService.js';

const statusColor = {
  created: 'muted',
  authorized: 'info',
  captured: 'success',
  failed: 'danger',
  refunded: 'warning',
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPayments()
      .then(setPayments)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  return (
    <>
      <h4 className="sr-page-title">Payment History</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{p.receipt}</td>
                <td className="sr-capitalize">{p.method}</td>
                <td>₹{p.amount}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[p.status]}`}>{p.status}</span>
                </td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/payments/${p._id}/invoice`} className="sr-btn sr-btn-ghost sr-btn-sm">
                    View Invoice
                  </Link>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={6}>No payments yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}