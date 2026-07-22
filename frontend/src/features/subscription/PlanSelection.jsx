import { useEffect, useState } from 'react';
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

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );
  
  if (error) return <div className="sr-alert sr-alert-danger">{error}</div>;

  return (
    <div className="sr-card-grid">
      {plans.map((plan) => (
        <div 
          key={plan._id}
          className={`sr-plan-card${selectedPlanId === plan._id ? ' selected' : ''}`}
          onClick={() => onSelect(plan)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3>{plan.name}</h3>
            {selectedPlanId === plan._id && <span className="sr-badge sr-badge-accent">Selected</span>}
          </div>
          <p className="sr-text-muted">{plan.description}</p>
          <div className="sr-plan-price">₹{plan.price}</div>
          <p className="sr-text-muted">{plan.duration} days</p>
          <ul className="sr-plan-features">
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}