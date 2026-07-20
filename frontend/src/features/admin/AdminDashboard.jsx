import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert, Table, ProgressBar, Badge } from 'react-bootstrap';
import { fetchDashboardStats, fetchRevenue, fetchTrends } from './dashboardService.js';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const subscriptionStatusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'secondary',
  CANCELLED: 'danger',
};

const complaintStatusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'secondary' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsData, revenueData, trendsData] = await Promise.all([
          fetchDashboardStats(),
          fetchRevenue(),
          fetchTrends(),
        ]);
        setStats(statsData);
        setRevenue(revenueData);
        setTrends(trendsData);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  // Last 6 months of registration activity, most recent last — a simple
  // relative-height bar chart built from plain divs, no charting library.
  const recentTrend = trends.registrationTrend.slice(-14);
  const maxTrendCount = Math.max(1, ...recentTrend.map((t) => t.count));

  const recentRevenue = revenue.monthlyRevenue.slice(-6);
  const maxRevenue = Math.max(1, ...recentRevenue.map((m) => m.total));

  return (
    <>
      <h4 className="mb-3">Admin Dashboard</h4>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Total Riders</Card.Title>
              <Card.Text className="fs-3">{stats.totalUsers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Total Drivers</Card.Title>
              <Card.Text className="fs-3">{stats.totalDrivers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Active Subscriptions</Card.Title>
              <Card.Text className="fs-3">{stats.activeSubscriptions}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Pending Assignments</Card.Title>
              <Card.Text className="fs-3">{stats.pendingAssignments}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Total Revenue</Card.Title>
              <Card.Text className="fs-3">₹{revenue.totalRevenue.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Attendance Rate</Card.Title>
              <Card.Text className="fs-3">
                {stats.attendanceRatePercent === null ? '—' : `${stats.attendanceRatePercent}%`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-muted small">Open Complaints</Card.Title>
              <Card.Text className="fs-3">
                {(stats.complaintStats.find((c) => c.status === 'open')?.count || 0) +
                  (stats.complaintStats.find((c) => c.status === 'in_progress')?.count || 0)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Subscription Status Distribution</Card.Title>
              {stats.subscriptionDistribution.map((s) => (
                <div key={s.status} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <Badge bg={subscriptionStatusColor[s.status] || 'secondary'}>{s.status}</Badge>
                    <span>{s.count}</span>
                  </div>
                </div>
              ))}
              {stats.subscriptionDistribution.length === 0 && (
                <p className="text-muted mb-0">No subscriptions yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Complaint Status</Card.Title>
              {stats.complaintStats.map((c) => (
                <div key={c.status} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <Badge bg={complaintStatusColor[c.status] || 'secondary'}>{c.status.replace('_', ' ')}</Badge>
                    <span>{c.count}</span>
                  </div>
                </div>
              ))}
              {stats.complaintStats.length === 0 && <p className="text-muted mb-0">No complaints yet</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Route Utilization</Card.Title>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Route</th>
                <th>City</th>
                <th>Occupancy</th>
                <th style={{ width: '35%' }}></th>
              </tr>
            </thead>
            <tbody>
              {stats.routeUtilization.map((r) => (
                <tr key={r.routeId}>
                  <td>{r.name}</td>
                  <td>{r.city}</td>
                  <td>
                    {r.currentOccupancy} / {r.capacity}
                  </td>
                  <td>
                    <ProgressBar
                      now={r.utilizationPercent}
                      label={`${r.utilizationPercent}%`}
                      variant={r.utilizationPercent >= 100 ? 'danger' : r.utilizationPercent >= 75 ? 'warning' : 'success'}
                    />
                  </td>
                </tr>
              ))}
              {stats.routeUtilization.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No active routes yet
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Monthly Revenue (last 6 months)</Card.Title>
              <div className="d-flex align-items-end gap-2" style={{ height: 140 }}>
                {recentRevenue.map((m) => (
                  <div key={`${m.year}-${m.month}`} className="text-center flex-grow-1">
                    <div
                      className="bg-primary rounded-top mx-auto"
                      style={{
                        height: `${Math.max(4, (m.total / maxRevenue) * 110)}px`,
                        width: '60%',
                      }}
                      title={`₹${m.total}`}
                    />
                    <div className="small text-muted mt-1">{MONTH_NAMES[m.month - 1]}</div>
                  </div>
                ))}
                {recentRevenue.length === 0 && <p className="text-muted mb-0">No revenue yet</p>}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Rider Registrations (last 14 days)</Card.Title>
              <div className="d-flex align-items-end gap-1" style={{ height: 140 }}>
                {recentTrend.map((t) => (
                  <div key={t.date} className="text-center flex-grow-1">
                    <div
                      className="bg-success rounded-top mx-auto"
                      style={{
                        height: `${Math.max(4, (t.count / maxTrendCount) * 110)}px`,
                        width: '70%',
                      }}
                      title={`${t.date}: ${t.count}`}
                    />
                  </div>
                ))}
                {recentTrend.length === 0 && <p className="text-muted mb-0">No registrations yet</p>}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}