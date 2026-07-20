import { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PlanSelection from './PlanSelection.jsx';
import AddressAutocomplete from '../../components/AddressAutocomplete.jsx';
import { createSubscriptionRequest } from './subscriptionService.js';

export default function SubscriptionCreate() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [homeAddress, setHomeAddress] = useState({ address: '', coordinates: null });
  const [desiredDestination, setDesiredDestination] = useState({ address: '', coordinates: null });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }
    setSubmitting(true);
    try {
      // coordinates travel through as-is when a Places suggestion was
      // picked (populating the field the backend already had ready since
      // Phase 6), or stay null if the rider typed a plain address —
      // exactly the same "Tier 1 only ever populates address" fallback
      // the schema was designed around.
      const subscription = await createSubscriptionRequest({
        planId: selectedPlan._id,
        homeAddress,
        desiredDestination,
      });
      navigate(`/subscriptions/${subscription._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h4 className="mb-3">Subscribe to Smart Ride</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>1. Choose a Plan</Card.Title>
          <PlanSelection selectedPlanId={selectedPlan?._id} onSelect={setSelectedPlan} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>2. Where are you commuting?</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Home Address</Form.Label>
              <AddressAutocomplete
                value={homeAddress.address}
                onChange={setHomeAddress}
                placeholder="e.g. 12 Park Street, Kolkata"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Destination</Form.Label>
              <AddressAutocomplete
                value={desiredDestination.address}
                onChange={setDesiredDestination}
                placeholder="e.g. Sector 5, Salt Lake"
                required
              />
            </Form.Group>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Continue'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}