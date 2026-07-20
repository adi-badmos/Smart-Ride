import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button type="submit" className="w-100" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </Button>
      </Form>
      <p className="text-center mt-3 mb-0">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </>
  );
}