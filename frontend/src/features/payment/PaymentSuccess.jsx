import { useParams, Link } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';

export default function PaymentSuccess() {
  const { id } = useParams();

  return (
    <Card className="text-center">
      <Card.Body className="py-5">
        <div className="mb-3" style={{ fontSize: '3rem' }}>
          ✅
        </div>
        <Card.Title>Payment Submitted</Card.Title>
        <p className="text-muted">
          Your payment was verified. It may take a few moments to fully confirm — refresh the subscription
          page if it still shows as pending.
        </p>
        <Alert variant="secondary" className="small text-start">
          Confirmation runs through Razorpay's webhook, not this page directly — that's what actually moves
          your subscription forward to the admin's assignment queue.
        </Alert>
        <Button as={Link} to={`/subscriptions/${id}`}>
          View Subscription
        </Button>
      </Card.Body>
    </Card>
  );
}