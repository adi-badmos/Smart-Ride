import { useState } from 'react';
import { Modal, Badge, Form, Button, Alert } from 'react-bootstrap';
import { updateComplaintRequest } from './complaintAdminService.js';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'secondary' };

export default function ComplaintDetail({ complaint, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [adminResponse, setAdminResponse] = useState(complaint.adminResponse || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setError('');
    setSubmitting(true);
    try {
      await updateComplaintRequest(complaint._id, { status, adminResponse });
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {complaint.subject} <Badge bg={statusColor[complaint.status]}>{complaint.status}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="text-muted small">
          Filed by {complaint.user?.name} ({complaint.user?.email}) — {complaint.type}, {complaint.priority}{' '}
          priority
        </p>
        <p>{complaint.description}</p>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Admin Response</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}