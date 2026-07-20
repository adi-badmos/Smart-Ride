import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Row, Col, Form, Button } from 'react-bootstrap';
import { fetchVehicles } from './vehicleService.js';
import PaginationControls from '../../../components/PaginationControls.jsx';
import VehicleForm from './VehicleForm.jsx';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const { vehicles: data, pagination: pageData } = await fetchVehicles({
        page,
        search: search || undefined,
        type: type || undefined,
      });
      setVehicles(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadVehicles();
  };

  return (
    <>
      <h4 className="mb-3">Vehicles</h4>
      <VehicleForm onCreated={loadVehicles} />
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSearchSubmit} className="mb-3">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              placeholder="Search by registration number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              <option value="">All types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
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
                <th>Reg. No.</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Make / Model</th>
                <th>Year</th>
                <th>Assigned Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>{v.registrationNumber}</td>
                  <td className="text-capitalize">{v.type}</td>
                  <td>{v.capacity}</td>
                  <td>
                    {v.make} {v.model}
                  </td>
                  <td>{v.year}</td>
                  <td>{v.driverProfile?.user?.name || '—'}</td>
                  <td>
                    <Badge bg={v.isActive ? 'success' : 'secondary'}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No vehicles found
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