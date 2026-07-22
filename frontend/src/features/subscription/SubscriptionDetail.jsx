import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSubscriptionById, cancelSubscriptionRequest } from './subscriptionService.js';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'muted',
  CANCELLED: 'danger',
};

export default function SubscriptionDetail() {
  const { id } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    fetchSubscriptionById(id)
      .then(setSubscription)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load subscription'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canCancel = subscription && ['WAITING_ASSIGNMENT', 'ACTIVE'].includes(subscription.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this subscription?')) return;
    setCancelling(true);
    try {
      await cancelSubscriptionRequest(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );
  if (!subscription) return null;

  return (
    <>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      <div className="sr-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="sr-card-title m-0">{subscription.plan?.name} Plan</h3>
          <span className={`sr-badge sr-badge-${statusColor[subscription.status]}`}>
            {subscription.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem', marginBottom: '1.5rem' }}>
          {/* Row 1 */}
          <div>
            <div className="sr-detail-label">Home</div>
            <div className="sr-detail-value">{subscription.homeAddress?.address}</div>
          </div>
          <div>
            <div className="sr-detail-label">Destination</div>
            <div className="sr-detail-value">{subscription.desiredDestination?.address}</div>
          </div>

          {/* Row 2 */}
          <div>
            <div className="sr-detail-label">Price / Duration</div>
            <div className="sr-detail-value">
              ₹{subscription.plan?.price} / {subscription.plan?.duration} days
            </div>
          </div>
          <div>
            <div className="sr-detail-label">Assigned Route</div>
            <div className="sr-detail-value">
              {subscription.route ? (
                <>{subscription.route.name} ({subscription.route.city})</>
              ) : (
                <span className="sr-text-muted">No route assigned yet.</span>
              )}
            </div>
          </div>
        </div>


        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {subscription.status === 'PAYMENT_PENDING' && (
            <Link to={`/subscriptions/${id}/checkout`} className="sr-btn sr-btn-primary">
              Pay Now
            </Link>
          )}

          {canCancel && (
            <button 
              className="sr-btn sr-btn-danger" 
              onClick={handleCancel} 
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}