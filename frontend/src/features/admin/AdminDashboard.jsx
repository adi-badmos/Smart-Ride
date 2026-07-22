import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchRevenue, fetchTrends } from './dashboardService.js';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const subscriptionStatusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'muted',
  CANCELLED: 'danger',
};

const complaintStatusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'muted' };

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

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;
  if (error) return <div className="sr-alert sr-alert-danger">{error}</div>;

  // Last 6 months of registration activity, most recent last — a simple
  // relative-height bar chart built from plain divs, no charting library.
  const recentTrend = trends.registrationTrend.slice(-14);
  const maxTrendCount = Math.max(1, ...recentTrend.map((t) => t.count));

  const recentRevenue = revenue.monthlyRevenue.slice(-6);
  const maxRevenue = Math.max(1, ...recentRevenue.map((m) => m.total));

  return (
    <>
      <h1 className="sr-page-title">Admin Dashboard</h1>

      <div className="sr-row sr-col-4" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-stat">
          <div className="sr-stat-label">Total Riders</div>
          <div className="sr-stat-value">{stats.totalUsers}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-label">Total Drivers</div>
          <div className="sr-stat-value">{stats.totalDrivers}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-label">Active Subscriptions</div>
          <div className="sr-stat-value">{stats.activeSubscriptions}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-label">Pending Assignments</div>
          <div className="sr-stat-value">{stats.pendingAssignments}</div>
        </div>
      </div>

      <div className="sr-row sr-col-3" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-stat">
          <div className="sr-stat-label">Total Revenue</div>
          <div className="sr-stat-value">₹{revenue.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-label">Attendance Rate</div>
          <div className="sr-stat-value">
            {stats.attendanceRatePercent === null ? '—' : `${stats.attendanceRatePercent}%`}
          </div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-label">Open Complaints</div>
          <div className="sr-stat-value">
            {(stats.complaintStats.find((c) => c.status === 'open')?.count || 0) +
              (stats.complaintStats.find((c) => c.status === 'in_progress')?.count || 0)}
          </div>
        </div>
      </div>

      <div className="sr-row sr-col-2" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-card">
          <div className="sr-card-title">Subscription Status Distribution</div>
          {stats.subscriptionDistribution.map((s) => (
            <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span className={`sr-badge sr-badge-${subscriptionStatusColor[s.status] || 'muted'}`}>{s.status}</span>
              <span>{s.count}</span>
            </div>
          ))}
          {stats.subscriptionDistribution.length === 0 && (
            <p className="sr-text-muted" style={{ margin: 0 }}>No subscriptions yet</p>
          )}
        </div>
        <div className="sr-card">
          <div className="sr-card-title">Complaint Status</div>
          {stats.complaintStats.map((c) => (
            <div key={c.status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span className={`sr-badge sr-badge-${complaintStatusColor[c.status] || 'muted'}`}>{c.status.replace('_', ' ')}</span>
              <span>{c.count}</span>
            </div>
          ))}
          {stats.complaintStats.length === 0 && <p className="sr-text-muted" style={{ margin: 0 }}>No complaints yet</p>}
        </div>
      </div>

      <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
        <div className="sr-card-title">Route Utilization</div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>City</th>
                <th>Occupancy</th>
                <th style={{ width: '35%' }}>Progress</th>
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
                    <div className="sr-progress">
                      <div
                        className={`sr-progress-bar${r.utilizationPercent >= 100 ? ' danger' : r.utilizationPercent >= 75 ? ' warn' : ''}`}
                        style={{ width: `${r.utilizationPercent}%` }}
                        title={`${r.utilizationPercent}%`}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {stats.routeUtilization.length === 0 && (
                <tr className="sr-table-empty">
                  <td colSpan={4}>
                    No active routes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sr-row sr-col-2">
        <div className="sr-card">
          <div className="sr-card-title">Monthly Revenue (last 6 months)</div>
          <div className="sr-bar-chart">
            {recentRevenue.map((m) => (
              <div key={`${m.year}-${m.month}`} className="sr-bar-col">
                <div
                  className="sr-bar"
                  style={{
                    height: `${Math.max(4, (m.total / maxRevenue) * 110)}px`,
                  }}
                  title={`₹${m.total}`}
                />
                <div className="sr-bar-label">{MONTH_NAMES[m.month - 1]}</div>
              </div>
            ))}
            {recentRevenue.length === 0 && <p className="sr-text-muted">No revenue yet</p>}
          </div>
        </div>
        <div className="sr-card">
          <div className="sr-card-title">Rider Registrations (last 14 days)</div>
          <div className="sr-bar-chart sr-bar-alt">
            {recentTrend.map((t) => (
              <div key={t.date} className="sr-bar-col">
                <div
                  className="sr-bar"
                  style={{
                    height: `${Math.max(4, (t.count / maxTrendCount) * 110)}px`,
                  }}
                  title={`${t.date}: ${t.count}`}
                />
              </div>
            ))}
            {recentTrend.length === 0 && <p className="sr-text-muted">No registrations yet</p>}
          </div>
        </div>
      </div>
    </>
  );
}