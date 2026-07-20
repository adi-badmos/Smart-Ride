import { useEffect, useState } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { createPlanRequest, updatePlanRequest } from './planAdminService.js';

const emptyForm = { name: '', description: '', duration: 30, price: 0, features: '', isActive: true };

export default function PlanForm({ initialPlan, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setForm({
        name: initialPlan.name,
        description: initialPlan.description || '',
        duration: initialPlan.duration,
        price: initialPlan.price,
        features: (initialPlan.features || []).join(', '),
        isActive: initialPlan.isActive,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialPlan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        duration: Number(form.duration),
        price: Number(form.price),
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };
      if (initialPlan) {
        await updatePlanRequest(initialPlan._id, payload);
        setSuccess('Plan updated');
      } else {
        await createPlanRequest(payload);
        setSuccess('Plan created');
        setForm(emptyForm);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{initialPlan ? 'Edit Plan' : 'Create Plan'}</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} />
            </Col>
            <Col md={4}>
              <Form.Label>Duration (days)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4}>
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Features (comma-separated)</Form.Label>
              <Form.Control name="features" value={form.features} onChange={handleChange} />
            </Col>
          </Row>
          <div className="d-flex gap-2 mt-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : initialPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
            {initialPlan && (
              <Button variant="outline-secondary" onClick={onCancelEdit} type="button">
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}