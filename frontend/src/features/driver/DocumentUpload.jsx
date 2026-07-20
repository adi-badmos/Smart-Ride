import { useEffect, useState } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { fetchMyDriverProfile, uploadDocumentRequest } from './driverService.js';

const DOC_TYPES = [
  { value: 'license', label: 'Driving License' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'vehicle_rc', label: 'Vehicle RC' },
];

const verificationColor = { pending: 'warning', in_review: 'info', approved: 'success', rejected: 'danger' };
const docStatusColor = { pending: 'secondary', approved: 'success', rejected: 'danger' };

export default function DocumentUpload() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('license');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchMyDriverProfile()
      .then(setProfile)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Please choose a file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', docType);
      formData.append('document', file);
      await uploadDocumentRequest(formData);
      setSuccess('Document uploaded successfully — pending review.');
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">My Documents</h4>
      {profile && (
        <p>
          Verification Status:{' '}
          <Badge bg={verificationColor[profile.verificationStatus]}>{profile.verificationStatus}</Badge>
        </p>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Upload a Document</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleUpload}>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>File (JPEG, PNG, or PDF — max 5MB)</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {profile?.documents.map((d) => (
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
          {(!profile || profile.documents.length === 0) && (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No documents uploaded yet
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}