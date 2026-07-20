import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button, Tabs, Tab, Row, Col, Form } from 'react-bootstrap';
import { fetchAllSubscriptions, fetchPendingSubscriptions } from './subscriptionAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import AssignRouteModal from './AssignRouteModal.jsx';

const statusColor = {
  PAYMENT_PENDING: 'warning',
  WAITING_ASSIGNMENT: 'info',
  ACTIVE: 'success',
  EXPIRED: 'secondary',
  CANCELLED: 'danger',
};

export default function SubscriptionList() {
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

  if (loading) return <Spinner animation="border" />;

  const renderPendingTable = (rows) => (
    <Table striped bordered hover responsive>
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
              <Badge bg={statusColor[s.status]}>{s.status}</Badge>
            </td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            <td>
              <Button size="sm" onClick={() => setAssigning(s)}>
                Assign Route
              </Button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-muted">
              Nothing pending
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );

  return (
    <>
      <h4 className="mb-3">Subscriptions</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Tabs defaultActiveKey="pending" className="mb-3">
        <Tab eventKey="pending" title={`Pending Assignment (${pending.length})`}>
          {renderPendingTable(pending)}
        </Tab>
        <Tab eventKey="all" title="All Subscriptions">
          <Form onSubmit={handleSearchSubmit} className="mb-3">
            <Row className="g-2">
              <Col md={4}>
                <Form.Control
                  placeholder="Search by rider name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="WAITING_ASSIGNMENT">Waiting Assignment</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Col>
              <Col md="auto">
                <Button type="submit" variant="outline-primary">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>

          <Table striped bordered hover responsive>
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
                    <Badge bg={statusColor[s.status]}>{s.status}</Badge>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </Tab>
      </Tabs>

      <AssignRouteModal
        subscription={assigning}
        show={!!assigning}
        onClose={() => setAssigning(null)}
        onAssigned={loadAll}
      />
    </>
  );
}