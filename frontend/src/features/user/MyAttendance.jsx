import { useEffect, useState } from 'react';
import { fetchMyAttendance } from './attendanceService.js';

const statusColor = { present: 'success', absent: 'danger', leave: 'warning' };

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyAttendance()
      .then(setRecords)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  return (
    <>
      <h4 className="sr-page-title">My Attendance</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Route</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.route?.name}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={3}>No attendance records yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}