import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DriverOnboarding() {
  const { registerDriver } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerDriver(form);
      navigate('/driver/documents');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="text-muted small">
        Register as a driver. You'll upload your documents next — your account needs admin verification
        before you can be assigned a route.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>License Number</Form.Label>
          <Form.Control name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>License Expiry</Form.Label>
          <Form.Control
            type="date"
            name="licenseExpiry"
            value={form.licenseExpiry}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button type="submit" className="w-100" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register as Driver'}
        </Button>
      </Form>
      <p className="text-center mt-3 mb-0">
        Riding with us instead? <Link to="/register">Sign up as a rider</Link>
      </p>
    </>
  );
}