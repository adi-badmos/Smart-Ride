import { useEffect, useState } from 'react';
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
      <div className="sr-page-header">
        <h1 className="sr-page-title">Vehicles</h1>
      </div>

      <VehicleForm onCreated={loadVehicles} />
      
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-filter-row" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input
            className="sr-input"
            placeholder="Search by registration number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />
          <select
            className="sr-select"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            style={{ maxWidth: '200px' }}
          >
            <option value="">All types</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="van">Van</option>
            <option value="bus">Bus</option>
          </select>
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
                    <td className="sr-capitalize">{v.type}</td>
                    <td>{v.capacity}</td>
                    <td>
                      {v.make} {v.model}
                    </td>
                    <td>{v.year}</td>
                    <td>{v.driverProfile?.user?.name || '—'}</td>
                    <td>
                      <span className={`sr-badge ${v.isActive ? 'sr-badge-success' : 'sr-badge-muted'}`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={7}>
                      No vehicles found
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