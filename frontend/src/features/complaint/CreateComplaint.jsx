import { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createComplaintRequest } from './complaintService.js';

const TYPES = ['service', 'driver', 'route', 'payment', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', description: '', type: 'service', priority: 'medium' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const complaint = await createComplaintRequest(form);
      navigate(`/complaints/${complaint._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>File a Complaint</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control name="subject" value={form.subject} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={form.type} onChange={handleChange}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}