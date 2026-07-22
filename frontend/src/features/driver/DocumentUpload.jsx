import { useEffect, useState } from 'react';
import { fetchMyDriverProfile, uploadDocumentRequest } from './driverService.js';

const DOC_TYPES = [
  { value: 'license', label: 'Driving License' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'vehicle_rc', label: 'Vehicle RC' },
];

const verificationColor = { pending: 'warning', in_review: 'info', approved: 'success', rejected: 'danger' };
const docStatusColor = { pending: 'muted', approved: 'success', rejected: 'danger' }; // mapped pending to muted instead of secondary

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

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  return (
    <>
      <h4 className="sr-page-title">My Documents</h4>
      {profile && (
        <p style={{ marginBottom: '1.5rem' }}>
          Verification Status:{' '}
          <span className={`sr-badge sr-badge-${verificationColor[profile.verificationStatus]}`}>
            {profile.verificationStatus}
          </span>
        </p>
      )}

      <div className="sr-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="sr-card-title">Upload a Document</h3>
        {error && <div className="sr-alert sr-alert-danger">{error}</div>}
        {success && <div className="sr-alert sr-alert-success">{success}</div>}
        <form onSubmit={handleUpload}>
          <div className="sr-form-group">
            <label className="sr-label">Document Type</label>
            <select className="sr-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sr-form-group">
            <label className="sr-label">File (JPEG, PNG, or PDF — max 5MB)</label>
            <input
              className="sr-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <button type="submit" className="sr-btn sr-btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="sr-table-wrap">
        <table className="sr-table">
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
                <td className="sr-capitalize">{d.type.replace('_', ' ')}</td>
                <td>
                  <span className={`sr-badge sr-badge-${docStatusColor[d.status]}`}>{d.status}</span>
                </td>
                <td>
                  <a href={d.url} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
            {(!profile || profile.documents.length === 0) && (
              <tr className="sr-table-empty">
                <td colSpan={3}>No documents uploaded yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}