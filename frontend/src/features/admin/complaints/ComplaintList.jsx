import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button, Row, Col, Form } from 'react-bootstrap';
import { fetchAllComplaints } from './complaintAdminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import ComplaintDetail from './ComplaintDetail.jsx';

const statusColor = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'secondary' };

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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Complaints</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-2 mb-3">
        <Col md={3}>
          <Form.Select
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
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
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
              <td className="text-capitalize">{c.type}</td>
              <td className="text-capitalize">{c.priority}</td>
              <td>
                <Badge bg={statusColor[c.status]}>{c.status.replace('_', ' ')}</Badge>
              </td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <Button size="sm" onClick={() => setSelected(c)}>
                  Manage
                </Button>
              </td>
            </tr>
          ))}
          {complaints.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                No complaints found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
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