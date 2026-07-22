import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="sr-auth-bg">
      <div className="sr-auth-card">
        <div className="sr-auth-logo">
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 8px #f59e0b)' }}>⚡</span>
          <span
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            SmartRide
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}