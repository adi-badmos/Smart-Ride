import { useEffect, useState } from 'react';
import { fetchAllComplaints } from './complaintAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import ComplaintDetail from './ComplaintDetail.jsx';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'muted' };

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { complaints: data, pagination: pageData } = await fetchAllComplaints({
        page,
        status: status || undefined,
      });
      setComplaints(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Complaints</h1>
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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Rider</th>
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
                <td>{c.user?.name}</td>
                <td>{c.subject}</td>
                <td className="sr-capitalize">{c.type}</td>
                <td className="sr-capitalize">{c.priority}</td>
                <td>
                  <span className={`sr-badge sr-badge-${statusColor[c.status]}`}>{c.status.replace('_', ' ')}</span>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => setSelected(c)}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={7}>
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />

      {selected && (
        <ComplaintDetail
          complaint={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </>
  );
}