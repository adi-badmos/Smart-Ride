import { useEffect, useState } from 'react';
import { fetchAttendanceHistory } from './attendanceAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';

const statusColor = { present: 'success', absent: 'danger', leave: 'warning' };

export default function AdminAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchAttendanceHistory({ page, status: status || undefined })
      .then(({ records: data, pagination: pageData }) => {
        setRecords(data);
        setPagination(pageData);
      })
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [page, status]);

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Attendance History</h1>
      </div>

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
        <select
          className="sr-select"
          style={{ maxWidth: '200px' }}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
      </div>

      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Rider</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.user?.name}</td>
                <td>{r.route?.name}</td>
                <td>{r.driver?.user?.name}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={5}>
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </>
  );
}