import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Payouts</h4>
      <CreatePayout onCreated={load} />
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-2 mb-3">
        <Col md={3}>
          <Form.Select
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
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
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
              <td style={{ minWidth: 160 }}>
                <Form.Select
                  size="sm"
                  value={p.status}
                  disabled={updatingId === p._id}
                  onChange={(e) => handleStatusChange(p._id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>{p.transactionRef || '—'}</td>
            </tr>
          ))}
          {payouts.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No payouts found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </>
  );
}