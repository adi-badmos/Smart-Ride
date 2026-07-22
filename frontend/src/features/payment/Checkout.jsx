import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );
  if (!subscription) return null;

  if (subscription.status !== 'PAYMENT_PENDING') {
    return <div className="sr-alert sr-alert-info">This subscription has already been paid for.</div>;
  }

  return (
    <div className="sr-card">
      <h3 className="sr-card-title">Checkout</h3>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      
      <div className="sr-detail-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-detail-label">Plan</div>
        <div className="sr-detail-value">{subscription.plan?.name}</div>
        
        <div className="sr-detail-label">Amount</div>
        <div className="sr-detail-value">₹{subscription.plan?.price}</div>
      </div>
      
      <div className="sr-alert sr-alert-muted">
        Sandbox/test mode — use Razorpay's test card numbers until real keys are configured. No real
        charge occurs in test mode.
      </div>
      
      <button className="sr-btn sr-btn-primary" onClick={handlePay} disabled={paying}>
        {paying ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}