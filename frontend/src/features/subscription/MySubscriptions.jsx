import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchMySubscriptions } from './subscriptionService.js';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'secondary',
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">My Subscriptions</h4>
        <Button as={Link} to="/subscriptions/new" size="sm">
          + New Subscription
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
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
                <Badge bg={statusColor[s.status]}>{s.status}</Badge>
              </td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              <td>
                <Button as={Link} to={`/subscriptions/${s._id}`} size="sm" variant="outline-primary">
                  View
                </Button>
              </td>
            </tr>
          ))}
          {subscriptions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No subscriptions yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}