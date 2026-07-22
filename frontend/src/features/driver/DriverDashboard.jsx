import { useState } from 'react';
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
      <p className="sr-text-sub">
        Register as a driver. You'll upload your documents next — your account needs admin verification
        before you can be assigned a route.
      </p>
      
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      
      <div className="sr-card">
        <form onSubmit={handleSubmit}>
          <div className="sr-form-group">
            <label className="sr-label">Name</label>
            <input className="sr-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Email</label>
            <input className="sr-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Phone</label>
            <input className="sr-input" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">Password</label>
            <input
              className="sr-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">License Number</label>
            <input className="sr-input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
          </div>
          
          <div className="sr-form-group">
            <label className="sr-label">License Expiry</label>
            <input
              className="sr-input"
              type="date"
              name="licenseExpiry"
              value={form.licenseExpiry}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="sr-btn sr-btn-primary sr-btn-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register as Driver'}
          </button>
        </form>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '1rem' }} className="sr-text-muted">
        Riding with us instead? <Link to="/register">Sign up as a rider</Link>
      </p>
    </>
  );
}