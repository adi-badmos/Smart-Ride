import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert, Table, Badge } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!payment) return null;

  return (
    <Card>
      <Card.Body>
        <Row className="mb-4">
          <Col>
            <h4 className="mb-0">Smart Ride</h4>
            <p className="text-muted small mb-0">Invoice / Receipt</p>
          </Col>
          <Col className="text-end">
            <Badge bg={payment.status === 'captured' ? 'success' : 'secondary'}>{payment.status}</Badge>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <p className="mb-1">
              <strong>Receipt No.</strong>
            </p>
            <p className="text-muted">{payment.receipt}</p>
          </Col>
          <Col md={6}>
            <p className="mb-1">
              <strong>Date</strong>
            </p>
            <p className="text-muted">{new Date(payment.createdAt).toLocaleString()}</p>
          </Col>
        </Row>

        <Table borderless size="sm">
          <tbody>
            <tr>
              <td>Plan</td>
              <td className="text-end">{payment.subscription?.plan?.name}</td>
            </tr>
            <tr>
              <td>Payment Method</td>
              <td className="text-end text-capitalize">{payment.method}</td>
            </tr>
            {payment.razorpayOrderId && (
              <tr>
                <td>Razorpay Order ID</td>
                <td className="text-end">{payment.razorpayOrderId}</td>
              </tr>
            )}
            {payment.razorpayPaymentId && (
              <tr>
                <td>Razorpay Payment ID</td>
                <td className="text-end">{payment.razorpayPaymentId}</td>
              </tr>
            )}
            <tr className="border-top">
              <td>
                <strong>Total Paid</strong>
              </td>
              <td className="text-end">
                <strong>
                  ₹{payment.amount} {payment.currency}
                </strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}