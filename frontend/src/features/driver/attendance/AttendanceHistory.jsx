import { useEffect, useState } from 'react';
import { fetchMyRoute } from '../driverService.js';
import { fetchRouteAttendance } from './attendanceService.js';

const todayStr = () => new Date().toISOString().slice(0, 10);
const statusColor = { present: 'success', absent: 'danger', leave: 'warning' };

export default function AttendanceHistory() {
  const [route, setRoute] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRoute()
      .then(setRoute)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!route) return;
    setLoading(true);
    setError('');
    fetchRouteAttendance(route._id, date)
      .then(setRecords)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [route, date]);

  return (
    <>
      <h4 className="sr-page-title">Attendance History</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-form-group" style={{ maxWidth: 220, marginBottom: '1.5rem' }}>
        <label className="sr-label">Date</label>
        <input 
          className="sr-input" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          max={todayStr()} 
        />
      </div>

      {!route && <div className="sr-alert sr-alert-info">You don't have an assigned route yet.</div>}

      {route && (
        <div className="sr-card">
          {loading ? (
            <div className="sr-spinner-wrap">
              <div className="sr-spinner" />
            </div>
          ) : (
            <div className="sr-table-wrap">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>Rider</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.user?.name}</td>
                      <td>
                        <span className={`sr-badge sr-badge-${statusColor[r.status]}`}>{r.status}</span>
                      </td>
                      <td>{r.notes || '—'}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr className="sr-table-empty">
                      <td colSpan={3}>No attendance marked for this date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}