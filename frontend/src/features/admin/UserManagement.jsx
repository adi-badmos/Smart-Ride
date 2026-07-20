import { useEffect, useState } from 'react';
import { Table, Badge, Button, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import { fetchUsers, updateUserStatusRequest } from './adminService.js';
import PaginationControls from '../../components/PaginationControls.jsx';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users: data, pagination: pageData } = await fetchUsers({ page, search: search || undefined });
      setUsers(data);
      setPagination(pageData);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const toggleStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateUserStatusRequest(id, !currentStatus);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <h4 className="mb-3">Manage Users</h4>
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
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <Badge bg={u.isActive ? 'success' : 'secondary'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant={u.isActive ? 'outline-danger' : 'outline-success'}
                      disabled={updatingId === u._id}
                      onClick={() => toggleStatus(u._id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No users found
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