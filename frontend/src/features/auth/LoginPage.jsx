import { useState } from 'react';
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
      const loggedInUser = await login(form);
      if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'driver') navigate('/driver/dashboard');
      else navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="sr-auth-title">Welcome back</h2>
      <p className="sr-auth-sub">Sign in to your SmartRide account</p>

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="sr-form-group">
          <label className="sr-label">Email</label>
          <input
            className="sr-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="sr-form-group">
          <label className="sr-label">Password</label>
          <input
            className="sr-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" className="sr-btn sr-btn-primary sr-btn-full sr-btn-lg" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </>
  );
}