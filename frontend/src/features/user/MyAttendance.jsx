import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">My Attendance</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
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
                <Badge bg={statusColor[r.status]}>{r.status}</Badge>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No attendance records yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}