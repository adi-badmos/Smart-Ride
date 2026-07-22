import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPaymentById } from './paymentService.js';

// Structured HTML view, per spec — no PDF export in this build.
export default function InvoiceView() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentById(id)
      .then(setPayment)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );
  if (error) return <div className="sr-alert sr-alert-danger">{error}</div>;
  if (!payment) return null;

  return (
    <div className="sr-card">
      <div className="sr-invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ margin: 0 }}>Smart Ride</h4>
          <p className="sr-text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Invoice / Receipt</p>
        </div>
        <div>
          <span className={`sr-badge sr-badge-${payment.status === 'captured' ? 'success' : 'muted'}`}>
            {payment.status}
          </span>
        </div>
      </div>

      <div className="sr-detail-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-detail-label">Receipt No.</div>
        <div className="sr-detail-value">{payment.receipt}</div>
        
        <div className="sr-detail-label">Date</div>
        <div className="sr-detail-value">{new Date(payment.createdAt).toLocaleString()}</div>
      </div>

      <hr className="sr-divider" />

      <table className="sr-table" style={{ border: 'none' }}>
        <tbody>
          <tr>
            <td>Plan</td>
            <td style={{ textAlign: 'right' }}>{payment.subscription?.plan?.name}</td>
          </tr>
          <tr>
            <td>Payment Method</td>
            <td className="sr-capitalize" style={{ textAlign: 'right' }}>{payment.method}</td>
          </tr>
          {payment.razorpayOrderId && (
            <tr>
              <td>Razorpay Order ID</td>
              <td style={{ textAlign: 'right' }}>{payment.razorpayOrderId}</td>
            </tr>
          )}
          {payment.razorpayPaymentId && (
            <tr>
              <td>Razorpay Payment ID</td>
              <td style={{ textAlign: 'right' }}>{payment.razorpayPaymentId}</td>
            </tr>
          )}
          <tr className="sr-invoice-total" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <td style={{ paddingTop: '1rem' }}>
              <strong>Total Paid</strong>
            </td>
            <td style={{ textAlign: 'right', paddingTop: '1rem' }}>
              <strong>
                ₹{payment.amount} {payment.currency}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}