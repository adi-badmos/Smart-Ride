import { useEffect, useState } from 'react';
import { fetchPlansAdmin, deactivatePlanRequest } from './planAdminService.js';
import PlanForm from './PlanForm.jsx';

export default function PlanList() {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPlansAdmin();
      setPlans(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this plan? Existing subscribers keep their plan — this only hides it from new signups.')) return;
    try {
      await deactivatePlanRequest(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to deactivate plan');
    }
  };

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Subscription Plans</h1>
      </div>

      <PlanForm
        initialPlan={editing}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onCancelEdit={() => setEditing(null)}
      />

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.duration} days</td>
                <td>₹{p.price}</td>
                <td>
                  <span className={`sr-badge ${p.isActive ? 'sr-badge-success' : 'sr-badge-muted'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    {p.isActive && (
                      <button className="sr-btn sr-btn-sm sr-btn-danger" onClick={() => handleDeactivate(p._id)}>
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={5}>
                  No plans yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}