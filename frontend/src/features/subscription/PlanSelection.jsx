import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchPlans } from './subscriptionService.js';

export default function PlanSelection({ selectedPlanId, onSelect }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Row className="g-3">
      {plans.map((plan) => (
        <Col md={4} key={plan._id}>
          <Card
            border={selectedPlanId === plan._id ? 'primary' : undefined}
            onClick={() => onSelect(plan)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-start">
                {plan.name}
                {selectedPlanId === plan._id && <Badge bg="primary">Selected</Badge>}
              </Card.Title>
              <Card.Text className="text-muted small">{plan.description}</Card.Text>
              <p className="fs-4 mb-1">₹{plan.price}</p>
              <p className="text-muted small mb-2">{plan.duration} days</p>
              <ul className="small ps-3 mb-0">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}