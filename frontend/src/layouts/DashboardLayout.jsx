import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/profile', label: 'Profile' },
    { to: '/subscriptions', label: 'My Subscriptions' },
    { to: '/payments', label: 'Payments' },
    { to: '/my-attendance', label: 'Attendance' },
    { to: '/complaints', label: 'Complaints' },
  ];

  const driverLinks = [
    { to: '/driver/dashboard', label: 'Dashboard' },
    { to: '/driver/documents', label: 'Documents' },
    { to: '/driver/attendance', label: 'Mark Attendance' },
    { to: '/driver/attendance/history', label: 'History' },
    { to: '/driver/earnings', label: 'Earnings' },
    { to: '/complaints', label: 'Complaints' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/drivers', label: 'Drivers' },
    { to: '/admin/vehicles', label: 'Vehicles' },
    { to: '/admin/routes', label: 'Routes' },
    { to: '/admin/plans', label: 'Plans' },
    { to: '/admin/subscriptions', label: 'Subscriptions' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/payouts', label: 'Payouts' },
    { to: '/admin/attendance', label: 'Attendance' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'driver'
      ? driverLinks
      : userLinks;

  return (
    <div className="sr-shell">
      <nav className="sr-nav">
        <div className="sr-nav-inner">
          <Link to="/" className="sr-logo">
            <span className="sr-logo-icon">⚡</span>
            <span className="sr-logo-text">SmartRide</span>
          </Link>

          <div className="sr-nav-links">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                className={({ isActive }) =>
                  'sr-nav-link' + (isActive ? ' active' : '')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="sr-nav-user">
            <span className="sr-nav-username">{user?.name}</span>
            <button className="sr-btn sr-btn-outline sr-btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="sr-main">
        <Outlet />
      </div>
    </div>
  );
}