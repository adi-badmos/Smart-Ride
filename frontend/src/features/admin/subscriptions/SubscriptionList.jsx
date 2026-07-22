import { useEffect, useState } from 'react';
import { fetchAllSubscriptions, fetchPendingSubscriptions } from './subscriptionAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import AssignRouteModal from './AssignRouteModal.jsx';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'muted',
  CANCELLED: 'danger',
};

export default function SubscriptionList() {
  const [activeTab, setActiveTab] = useState('pending');
  const [all, setAll] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{ subscriptions: allData, pagination: pageData }, pendingData] = await Promise.all([
        fetchAllSubscriptions({ page, search: search || undefined, status: status || undefined }),
        fetchPendingSubscriptions(),
      ]);
      setAll(allData);
      setPagination(pageData);
      setPending(pendingData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAll();
  };

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;

  const renderPendingTable = (rows) => (
    <div className="sr-table-wrap">
      <table className="sr-table">
        <thead>
          <tr>
            <th>Rider</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s._id}>
              <td>{s.user?.name}</td>
              <td>{s.plan?.name}</td>
              <td>
                <span className={`sr-badge sr-badge-${statusColor[s.status]}`}>{s.status}</span>
              </td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="sr-btn sr-btn-sm sr-btn-primary" onClick={() => setAssigning(s)}>
                  Assign Route
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="sr-table-empty">
              <td colSpan={5}>
                Nothing pending
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Subscriptions</h1>
      </div>

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`sr-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Assignment ({pending.length})
        </button>
        <button
          className={`sr-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Subscriptions
        </button>
      </div>

      {activeTab === 'pending' && renderPendingTable(pending)}
      
      {activeTab === 'all' && (
        <>
          <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
              <input
                className="sr-input"
                placeholder="Search by rider name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
              <select
                className="sr-select"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                style={{ maxWidth: '240px' }}
              >
                <option value="">All statuses</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="WAITING_ASSIGNMENT">Waiting Assignment</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button type="submit" className="sr-btn sr-btn-outline">
                Search
              </button>
            </form>
          </div>

          <div className="sr-table-wrap" style={{ marginBottom: '1rem' }}>
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Plan</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {all.map((s) => (
                  <tr key={s._id}>
                    <td>{s.user?.name}</td>
                    <td>{s.plan?.name}</td>
                    <td>{s.route?.name || '—'}</td>
                    <td>
                      <span className={`sr-badge sr-badge-${statusColor[s.status]}`}>{s.status}</span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {all.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={5}>
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <AssignRouteModal
        subscription={assigning}
        show={!!assigning}
        onClose={() => setAssigning(null)}
        onAssigned={loadAll}
      />
    </>
  );
}