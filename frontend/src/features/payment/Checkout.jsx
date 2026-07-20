import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { fetchSubscriptionById } from '../subscription/subscriptionService.js';
import { createOrderRequest, verifyPaymentRequest } from './paymentService.js';

// Real Razorpay Checkout widget, replacing Phase 7's MockCheckout as the
// primary flow. Note: verify() only confirms the signature for immediate
// UI feedback — the actual PAYMENT_PENDING -> WAITING_ASSIGNMENT
// transition happens only via the webhook (see payment.service.js),
// which is asynchronous and needs a publicly reachable backend URL
// (e.g. ngrok in local dev) registered in the Razorpay dashboard.
export default function Checkout() {
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
      const order = await createOrderRequest(id);

      if (typeof window.Razorpay === 'undefined') {
        setError('Payment widget failed to load. Check your connection and try again.');
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Smart Ride',
        description: `${subscription.plan?.name} plan subscription`,
        handler: async (response) => {
          try {
            await verifyPaymentRequest({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/subscriptions/${id}/payment-success`);
          } catch (err) {
            setError(err.response?.data?.error?.message || 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#0d6efd' },
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to start checkout');
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
          Sandbox/test mode — use Razorpay's test card numbers until real keys are configured. No real
          charge occurs in test mode.
        </Alert>
        <Button onClick={handlePay} disabled={paying}>
          {paying ? 'Processing...' : 'Pay Now'}
        </Button>
      </Card.Body>
    </Card>
  );
}