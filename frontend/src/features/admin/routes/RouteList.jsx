import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Button, Row, Col, Form } from 'react-bootstrap';
import { fetchRoutes, deleteRouteRequest } from './routeService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import RouteForm from './RouteForm.jsx';
import RouteDetail from './RouteDetail.jsx';

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const { routes: data, pagination: pageData } = await fetchRoutes({ page, search: search || undefined });
      setRoutes(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRoutes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await deleteRouteRequest(id);
      setSelected(null);
      loadRoutes();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete route');
    }
  };

  return (
    <>
      <h4 className="mb-3">Routes</h4>
      <RouteForm
        initialRoute={editing}
        onSaved={() => {
          setEditing(null);
          loadRoutes();
        }}
      />
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSearchSubmit} className="mb-3">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              placeholder="Search by route name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                <th>City</th>
                <th>Pickup Points</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.city}</td>
                  <td>{r.pickupPoints.length}</td>
                  <td>{r.driver?.user?.name || '—'}</td>
                  <td>{r.vehicle?.registrationNumber || '—'}</td>
                  <td>{r.capacity}</td>
                  <td>
                    <Badge bg={r.status === 'active' ? 'success' : 'secondary'}>{r.status}</Badge>
                  </td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => setSelected(r)}>
                      View
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setEditing(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No routes found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </>
      )}
      <RouteDetail route={selected} />
    </>
  );
}