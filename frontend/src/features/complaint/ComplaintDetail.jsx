import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { fetchComplaintById } from './complaintService.js';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'secondary' };

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaintById(id)
      .then(setComplaint)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!complaint) return null;

  return (
    <Card>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          {complaint.subject}
          <Badge bg={statusColor[complaint.status]}>{complaint.status.replace('_', ' ')}</Badge>
        </Card.Title>
        <p className="text-muted small">
          {complaint.type} • {complaint.priority} priority • filed{' '}
          {new Date(complaint.createdAt).toLocaleDateString()}
        </p>
        <p>{complaint.description}</p>

        {complaint.adminResponse && (
          <Alert variant="secondary">
            <strong>Admin response:</strong>
            <br />
            {complaint.adminResponse}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}