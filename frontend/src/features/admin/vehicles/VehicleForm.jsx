import { useEffect, useState } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { createVehicleRequest } from './vehicleService.js';
import { fetchDrivers } from '../adminService.js';

const emptyForm = {
  registrationNumber: '',
  type: 'sedan',
  capacity: 4,
  make: '',
  model: '',
  year: new Date().getFullYear(),
  insuranceExpiry: '',
  driverProfile: '',
};

export default function VehicleForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers()
      .then(setDrivers)
      .catch(() => setDrivers([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createVehicleRequest({
        ...form,
        capacity: Number(form.capacity),
        year: Number(form.year),
        driverProfile: form.driverProfile || null,
      });
      setSuccess('Vehicle added successfully');
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Add Vehicle</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Registration Number</Form.Label>
              <Form.Control
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={form.type} onChange={handleChange}>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Make</Form.Label>
              <Form.Control name="make" value={form.make} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Model</Form.Label>
              <Form.Control name="model" value={form.model} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Year</Form.Label>
              <Form.Control type="number" name="year" value={form.year} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <Form.Label>Insurance Expiry</Form.Label>
              <Form.Control
                type="date"
                name="insuranceExpiry"
                value={form.insuranceExpiry}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Assign Driver (optional)</Form.Label>
              <Form.Select name="driverProfile" value={form.driverProfile} onChange={handleChange}>
                <option value="">— Unassigned —</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.licenseNumber})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}