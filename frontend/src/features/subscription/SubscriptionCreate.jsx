import { useState } from 'react';
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
      <h4 className="sr-page-title">Subscribe to Smart Ride</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="sr-card-title">1. Choose a Plan</h3>
        <PlanSelection selectedPlanId={selectedPlan?._id} onSelect={setSelectedPlan} />
      </div>

      <div className="sr-card">
        <h3 className="sr-card-title">2. Where are you commuting?</h3>
        <form onSubmit={handleSubmit}>
          <div className="sr-form-group">
            <label className="sr-label">Home Address</label>
            <AddressAutocomplete
              value={homeAddress.address}
              onChange={setHomeAddress}
              placeholder="e.g. 12 Park Street, Kolkata"
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Destination</label>
            <AddressAutocomplete
              value={desiredDestination.address}
              onChange={setDesiredDestination}
              placeholder="e.g. Sector 5, Salt Lake"
              required
            />
          </div>
          <button type="submit" className="sr-btn sr-btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Continue'}
          </button>
        </form>
      </div>
    </>
  );
}