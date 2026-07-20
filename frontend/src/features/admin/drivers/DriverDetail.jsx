import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Badge, Table, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { fetchDriverById, verifyDriverRequest } from '../adminService.js';

const verificationColor = { pending: 'warning', in_review: 'info', approved: 'success', rejected: 'danger' };
const docStatusColor = { pending: 'secondary', approved: 'success', rejected: 'danger' };

export default function DriverDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDriverById(id)
      .then((data) => {
        setDriver(data);
        setNextStatus(data.verificationStatus);
      })
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load driver'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await verifyDriverRequest(id, nextStatus);
      setSuccess('Verification status updated');
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update verification status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!driver) return null;

  return (
    <>
      <h4 className="mb-3">Driver Detail</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <p className="mb-1">
                <strong>Name</strong>
              </p>
              <p className="text-muted">{driver.user?.name}</p>
            </Col>
            <Col md={6}>
              <p className="mb-1">
                <strong>Email</strong>
              </p>
              <p className="text-muted">{driver.user?.email}</p>
            </Col>
            <Col md={6}>
              <p className="mb-1">
                <strong>Phone</strong>
              </p>
              <p className="text-muted">{driver.user?.phone}</p>
            </Col>
            <Col md={6}>
              <p className="mb-1">
                <strong>License</strong>
              </p>
              <p className="text-muted">
                {driver.licenseNumber} (expires {new Date(driver.licenseExpiry).toLocaleDateString()})
              </p>
            </Col>
          </Row>

          <p className="mb-2">
            <strong>Current Status:</strong>{' '}
            <Badge bg={verificationColor[driver.verificationStatus]}>{driver.verificationStatus}</Badge>
          </p>

          <Form.Group className="mb-2" style={{ maxWidth: 300 }}>
            <Form.Label>Update Verification Status</Form.Label>
            <Form.Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
          <Button onClick={handleVerify} disabled={submitting || nextStatus === driver.verificationStatus}>
            {submitting ? 'Updating...' : 'Update Status'}
          </Button>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Documents</Card.Title>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {driver.documents.map((d) => (
                <tr key={d._id}>
                  <td className="text-capitalize">{d.type.replace('_', ' ')}</td>
                  <td>
                    <Badge bg={docStatusColor[d.status]}>{d.status}</Badge>
                  </td>
                  <td>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {driver.documents.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    No documents uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}