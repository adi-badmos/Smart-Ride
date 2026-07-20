import { useEffect, useState } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { fetchDrivers } from '../adminService.js';
import { createPayoutRequest } from './payoutAdminService.js';

const emptyForm = { driverProfileId: '', amount: '', startDate: '', endDate: '' };

export default function CreatePayout({ onCreated }) {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers().then(setDrivers).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createPayoutRequest({
        driverProfileId: form.driverProfileId,
        amount: Number(form.amount),
        period: { startDate: form.startDate, endDate: form.endDate },
      });
      setSuccess('Payout created');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create payout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Create Payout</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Driver</Form.Label>
              <Form.Select name="driverProfileId" value={form.driverProfileId} onChange={handleChange} required>
                <option value="">Select a driver</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.user?.email})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min={0}
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Period Start</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Period End</Form.Label>
              <Form.Control type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </Col>
          </Row>
          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Payout'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}