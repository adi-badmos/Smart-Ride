import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <h4 className="mb-3">My Earnings</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <p className="text-muted">
        Total paid to date: <strong>₹{totalPaid}</strong>
      </p>
      <Table striped bordered hover responsive>
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
                <Badge bg={statusColor[p.status]}>{p.status}</Badge>
              </td>
              <td>{p.transactionRef || '—'}</td>
            </tr>
          ))}
          {payouts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No payouts yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}