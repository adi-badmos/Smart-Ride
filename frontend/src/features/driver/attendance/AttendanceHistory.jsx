import { useEffect, useState } from 'react';
import { Card, Table, Form, Alert, Spinner, Badge } from 'react-bootstrap';
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
      <h4 className="mb-3">Attendance History</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" style={{ maxWidth: 250 }}>
        <Form.Label>Date</Form.Label>
        <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} />
      </Form.Group>

      {!route && <Alert variant="info">You don't have an assigned route yet.</Alert>}

      {route && (
        <Card>
          <Card.Body>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <Table striped bordered hover responsive>
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
                        <Badge bg={statusColor[r.status]}>{r.status}</Badge>
                      </td>
                      <td>{r.notes || '—'}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        No attendance marked for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}