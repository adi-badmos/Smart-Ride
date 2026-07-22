import { useEffect, useState } from 'react';
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
      <div className="sr-page-header">
        <h1 className="sr-page-title">Manage Users</h1>
      </div>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input
            className="sr-input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />
          <button type="submit" className="sr-btn sr-btn-outline">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="sr-spinner-wrap"><div className="sr-spinner" /></div>
      ) : (
        <>
          <div className="sr-table-wrap" style={{ marginBottom: '1rem' }}>
            <table className="sr-table">
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
                      <span className={`sr-badge ${u.isActive ? 'sr-badge-success' : 'sr-badge-muted'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`sr-btn sr-btn-sm ${u.isActive ? 'sr-btn-danger' : 'sr-btn-success'}`}
                        disabled={updatingId === u._id}
                        onClick={() => toggleStatus(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={6}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </>
  );
}