import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { fetchSubscriptionById, cancelSubscriptionRequest } from './subscriptionService.js';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'secondary',
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

  if (loading) return <Spinner animation="border" />;
  if (!subscription) return null;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card>
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center">
            {subscription.plan?.name} Plan
            <Badge bg={statusColor[subscription.status]}>{subscription.status}</Badge>
          </Card.Title>
          <p className="text-muted">
            ₹{subscription.plan?.price} / {subscription.plan?.duration} days
          </p>

          <p className="mb-1">
            <strong>Home:</strong> {subscription.homeAddress?.address}
          </p>
          <p className="mb-3">
            <strong>Destination:</strong> {subscription.desiredDestination?.address}
          </p>

          {subscription.route ? (
            <p className="mb-1">
              <strong>Assigned Route:</strong> {subscription.route.name} ({subscription.route.city})
            </p>
          ) : (
            <p className="text-muted mb-1">No route assigned yet.</p>
          )}

          {subscription.status === 'PAYMENT_PENDING' && (
            <Button as={Link} to={`/subscriptions/${id}/checkout`} className="mt-2">
              Pay Now
            </Button>
          )}

          {canCancel && (
            <Button variant="outline-danger" className="mt-3 ms-2" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          )}
        </Card.Body>
      </Card>
    </>
  );
}