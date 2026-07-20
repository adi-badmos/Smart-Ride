import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchMyPayments } from './paymentService.js';

const statusColor = {
  created: 'secondary',
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Payment History</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
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
              <td className="text-capitalize">{p.method}</td>
              <td>₹{p.amount}</td>
              <td>
                <Badge bg={statusColor[p.status]}>{p.status}</Badge>
              </td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/payments/${p._id}/invoice`}>View Invoice</Link>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No payments yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}