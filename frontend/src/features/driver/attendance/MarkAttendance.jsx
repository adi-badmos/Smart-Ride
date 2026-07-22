import { useEffect, useState } from 'react';
import { fetchMyRoute, fetchMyCommuters } from '../driverService.js';
import { markAttendanceRequest, fetchRouteAttendance } from './attendanceService.js';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function MarkAttendance() {
  const [route, setRoute] = useState(null);
  const [commuters, setCommuters] = useState([]);
  const [date, setDate] = useState(todayStr());
  // Keyed by subscription id — c._id from getMyCommuters IS the
  // subscription id (see driver.controller.js:getMyCommuters), matching
  // Attendance.subscription returned here.
  const [marked, setMarked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [routeData, commutersData] = await Promise.all([fetchMyRoute(), fetchMyCommuters()]);
      setRoute(routeData);
      setCommuters(commutersData);
      if (routeData) {
        const records = await fetchRouteAttendance(routeData._id, date);
        const map = {};
        records.forEach((r) => {
          map[r.subscription] = r;
        });
        setMarked(map);
      } else {
        setMarked({});
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleMark = async (subscriptionId, status) => {
    setError('');
    setSubmittingId(subscriptionId);
    try {
      const record = await markAttendanceRequest({ subscriptionId, date, status });
      setMarked((prev) => ({ ...prev, [subscriptionId]: record }));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to mark attendance');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return (
    <div className="sr-spinner-wrap">
      <div className="sr-spinner" />
    </div>
  );

  return (
    <>
      <h4 className="sr-page-title">Mark Attendance</h4>
      {error && <div className="sr-alert sr-alert-danger">{error}</div>}

      <div className="sr-form-group" style={{ maxWidth: 220, marginBottom: '1.5rem' }}>
        <label className="sr-label">Date</label>
        <input 
          className="sr-input" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          max={todayStr()} 
        />
      </div>

      {!route && <div className="sr-alert sr-alert-info">You don't have an assigned route yet.</div>}

      {route && (
        <div className="sr-card">
          <h3 className="sr-card-title">{route.name}</h3>
          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Pickup Point</th>
                  <th>Status</th>
                  <th>Mark</th>
                </tr>
              </thead>
              <tbody>
                {commuters.map((c) => {
                  const existing = marked[c._id];
                  return (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.pickupPoint}</td>
                      <td>
                        {existing ? (
                          <span
                            className={`sr-badge sr-badge-${
                              existing.status === 'present'
                                ? 'success'
                                : existing.status === 'absent'
                                ? 'danger'
                                : 'warning'
                            }`}
                          >
                            {existing.status}
                          </span>
                        ) : (
                          <span className="sr-badge sr-badge-muted">Not marked</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="sr-btn sr-btn-success sr-btn-sm"
                            disabled={!!existing || submittingId === c._id}
                            onClick={() => handleMark(c._id, 'present')}
                          >
                            Present
                          </button>
                          <button
                            className="sr-btn sr-btn-danger sr-btn-sm"
                            disabled={!!existing || submittingId === c._id}
                            onClick={() => handleMark(c._id, 'absent')}
                          >
                            Absent
                          </button>
                          <button
                            className="sr-btn sr-btn-warning sr-btn-sm"
                            disabled={!!existing || submittingId === c._id}
                            onClick={() => handleMark(c._id, 'leave')}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {commuters.length === 0 && (
                  <tr className="sr-table-empty">
                    <td colSpan={4}>No riders on your route</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}