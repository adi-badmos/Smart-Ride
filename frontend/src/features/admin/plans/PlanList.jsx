import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Subscription Plans</h4>
      <PlanForm
        initialPlan={editing}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onCancelEdit={() => setEditing(null)}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
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
                <Badge bg={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
              </td>
              <td className="d-flex gap-2">
                <Button size="sm" variant="outline-secondary" onClick={() => setEditing(p)}>
                  Edit
                </Button>
                {p.isActive && (
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeactivate(p._id)}>
                    Deactivate
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {plans.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No plans yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}