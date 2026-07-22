import { useEffect, useState } from 'react';
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
      <div className="sr-page-header">
        <h1 className="sr-page-title">Drivers</h1>
      </div>
      
      <CreateDriverForm onCreated={loadDrivers} />
      
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
          <select
            className="sr-select"
            value={verificationStatus}
            onChange={(e) => {
              setPage(1);
              setVerificationStatus(e.target.value);
            }}
            style={{ maxWidth: '240px' }}
          >
            <option value="">All verification statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
                      <span className={`sr-badge ${d.verificationStatus === 'approved' ? 'sr-badge-success' : 'sr-badge-muted'}`}>
                        {d.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/drivers/${d._id}`} className="sr-btn sr-btn-outline sr-btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={7}>
                      No drivers found
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