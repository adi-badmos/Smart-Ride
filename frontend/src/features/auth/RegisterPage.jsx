import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="sr-auth-title">Create your account</h2>
      <p className="sr-auth-sub">Join SmartRide and start commuting smarter</p>

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="sr-form-group">
          <label className="sr-label">Full Name</label>
          <input className="sr-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Email</label>
          <input className="sr-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Phone</label>
          <input className="sr-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Password</label>
          <input
            className="sr-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />
        </div>
        <button type="submit" className="sr-btn sr-btn-primary sr-btn-full sr-btn-lg" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign Up Free'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Want to drive? <Link to="/driver/register">Register as a driver</Link>
      </p>
    </>
  );
}