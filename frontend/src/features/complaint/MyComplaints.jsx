import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchMyComplaints } from './complaintService.js';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'secondary' };

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyComplaints()
      .then(setComplaints)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">My Complaints</h4>
        <Button as={Link} to="/complaints/new" size="sm">
          + New Complaint
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Filed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td>{c.subject}</td>
              <td className="text-capitalize">{c.type}</td>
              <td className="text-capitalize">{c.priority}</td>
              <td>
                <Badge bg={statusColor[c.status]}>{c.status.replace('_', ' ')}</Badge>
              </td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <Button as={Link} to={`/complaints/${c._id}`} size="sm" variant="outline-primary">
                  View
                </Button>
              </td>
            </tr>
          ))}
          {complaints.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No complaints filed yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}