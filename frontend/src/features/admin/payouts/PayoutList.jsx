import { useEffect, useState } from 'react';
import { fetchAllPayouts, updatePayoutRequest } from './payoutAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import CreatePayout from './CreatePayout.jsx';

const STATUSES = ['pending', 'processed', 'paid', 'failed'];
const statusColor = { pending: 'warning', processed: 'info', paid: 'success', failed: 'danger' };

export default function PayoutList() {
  const [payouts, setPayouts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { payouts: data, pagination: pageData } = await fetchAllPayouts({
        page,
        status: statusFilter || undefined,
      });
      setPayouts(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const updated = await updatePayoutRequest(id, { status });
      setPayouts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update payout');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>;

  return (
    <>
      <div className="sr-page-header">
        <h1 className="sr-page-title">Payouts</h1>
      </div>

      <CreatePayout onCreated={load} />

      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
        <select
          className="sr-select"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction Ref</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p._id}>
                <td>{p.driverProfile?.user?.name}</td>
                <td>
                  {new Date(p.period.startDate).toLocaleDateString()} –{' '}
                  {new Date(p.period.endDate).toLocaleDateString()}
                </td>
                <td>₹{p.amount}</td>
                <td style={{ minWidth: '160px' }}>
                  <select
                    className="sr-select"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    value={p.status}
                    disabled={updatingId === p._id}
                    onChange={(e) => handleStatusChange(p._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{p.transactionRef || '—'}</td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr className="sr-table-empty">
                <td colSpan={5}>
                  No payouts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </>
  );
}