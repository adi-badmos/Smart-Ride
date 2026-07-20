import { useState } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { createDriverRequest } from '../adminService.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  licenseNumber: '',
  licenseExpiry: '',
};

export default function CreateDriverForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createDriverRequest(form);
      setSuccess('Driver account created successfully');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Create Driver Account</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>License Number</Form.Label>
              <Form.Control name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>License Expiry</Form.Label>
              <Form.Control
                type="date"
                name="licenseExpiry"
                value={form.licenseExpiry}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Driver'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}