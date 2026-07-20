import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand as={Link} to="/">
          Smart Ride
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
            {user?.role === 'user' && (
              <>
                <Nav.Link as={Link} to="/subscriptions">
                  My Subscriptions
                </Nav.Link>
                <Nav.Link as={Link} to="/payments">
                  Payments
                </Nav.Link>
                <Nav.Link as={Link} to="/my-attendance">
                  My Attendance
                </Nav.Link>
                <Nav.Link as={Link} to="/complaints">
                  Complaints
                </Nav.Link>
              </>
            )}
            {user?.role === 'driver' && (
              <>
                <Nav.Link as={Link} to="/driver/dashboard">
                  My Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/driver/documents">
                  My Documents
                </Nav.Link>
                <Nav.Link as={Link} to="/driver/attendance">
                  Mark Attendance
                </Nav.Link>
                <Nav.Link as={Link} to="/driver/attendance/history">
                  Attendance History
                </Nav.Link>
                <Nav.Link as={Link} to="/driver/earnings">
                  Earnings
                </Nav.Link>
                <Nav.Link as={Link} to="/complaints">
                  Complaints
                </Nav.Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/users">
                  Users
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/drivers">
                  Drivers
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/vehicles">
                  Vehicles
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/routes">
                  Routes
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/plans">
                  Plans
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/subscriptions">
                  Subscriptions
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/complaints">
                  Complaints
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/payouts">
                  Payouts
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/attendance">
                  Attendance
                </Nav.Link>
              </>
            )}
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">{user?.name}</span>
            <Button size="sm" variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Navbar>
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}