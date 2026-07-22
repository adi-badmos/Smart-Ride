import { useEffect, useState } from 'react';
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
      <div className="sr-page-header">
        <h1 className="sr-page-title">Routes</h1>
      </div>

      <RouteForm
        initialRoute={editing}
        onSaved={() => {
          setEditing(null);
          loadRoutes();
        }}
      />
      
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input
            className="sr-input"
            placeholder="Search by route name"
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
                      <span className={`sr-badge ${r.status === 'active' ? 'sr-badge-success' : 'sr-badge-muted'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => setSelected(r)}>
                          View
                        </button>
                        <button className="sr-btn sr-btn-sm sr-btn-outline" onClick={() => setEditing(r)}>
                          Edit
                        </button>
                        <button className="sr-btn sr-btn-sm sr-btn-danger" onClick={() => handleDelete(r._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={8}>
                      No routes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </>
      )}
      <RouteDetail route={selected} />
    </>
  );
}