import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchDrivers } from '../adminService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import CreateDriverForm from './CreateDriverForm.jsx';

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const { drivers: data, pagination: pageData } = await fetchDrivers({
        page,
        search: search || undefined,
        verificationStatus: verificationStatus || undefined,
      });
      setDrivers(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, verificationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadDrivers();
  };

  return (
    <>
      <h4 className="mb-3">Drivers</h4>
      <CreateDriverForm onCreated={loadDrivers} />
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSearchSubmit} className="mb-3">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={verificationStatus}
              onChange={(e) => {
                setPage(1);
                setVerificationStatus(e.target.value);
              }}
            >
              <option value="">All verification statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Col>
          <Col md="auto">
            <Button type="submit" variant="outline-primary">
              Search
            </Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>License No.</th>
                <th>License Expiry</th>
                <th>Verification</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id}>
                  <td>{d.user?.name}</td>
                  <td>{d.user?.email}</td>
                  <td>{d.user?.phone}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{new Date(d.licenseExpiry).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={d.verificationStatus === 'approved' ? 'success' : 'secondary'}>
                      {d.verificationStatus}
                    </Badge>
                  </td>
                  <td>
                    <Button as={Link} to={`/admin/drivers/${d._id}`} size="sm" variant="outline-primary">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </>
  );
}