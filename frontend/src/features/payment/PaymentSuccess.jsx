import { useParams, Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const { id } = useParams();

  return (
    <div className="sr-card sr-success-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div className="sr-success-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        ✅
      </div>
      <h3 className="sr-card-title">Payment Submitted</h3>
      <p className="sr-text-muted" style={{ marginBottom: '1.5rem' }}>
        Your payment was verified. It may take a few moments to fully confirm — refresh the subscription
        page if it still shows as pending.
      </p>
      <div className="sr-alert sr-alert-muted" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
        Confirmation runs through Razorpay's webhook, not this page directly — that's what actually moves
        your subscription forward to the admin's assignment queue.
      </div>
      <Link to={`/subscriptions/${id}`} className="sr-btn sr-btn-primary">
        View Subscription
      </Link>
    </div>
  );
}