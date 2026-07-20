import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { fetchSubscriptionById } from '../subscription/subscriptionService.js';
import { mockPayRequest } from './paymentService.js';

// A simple "Pay Now" button, no real checkout widget yet — that's
// Checkout.jsx in Phase 9, once Razorpay replaces this mock.
export default function MockCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchSubscriptionById(id)
      .then(setSubscription)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load subscription'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    setError('');
    setPaying(true);
    try {
      await mockPayRequest(id);
      navigate(`/subscriptions/${id}/payment-success`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!subscription) return null;

  if (subscription.status !== 'PAYMENT_PENDING') {
    return <Alert variant="info">This subscription has already been paid for.</Alert>;
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Checkout</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="mb-1">
          <strong>Plan:</strong> {subscription.plan?.name}
        </p>
        <p className="mb-3">
          <strong>Amount:</strong> ₹{subscription.plan?.price}
        </p>
        <Alert variant="secondary" className="small">
          This is a mock payment for development — no real charge occurs. Real payment via Razorpay
          arrives in a later build phase.
        </Alert>
        <Button onClick={handlePay} disabled={paying}>
          {paying ? 'Processing...' : 'Pay Now'}
        </Button>
      </Card.Body>
    </Card>
  );
}