import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Attendance History</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-2 mb-3">
        <Col md={3}>
          <Form.Select
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
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
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
                <Badge bg={statusColor[r.status]}>{r.status}</Badge>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No attendance records found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </>
  );
}