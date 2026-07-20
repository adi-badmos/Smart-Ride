import { useEffect, useState } from 'react';
import { Card, Table, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
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

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h4 className="mb-3">Mark Attendance</h4>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" style={{ maxWidth: 250 }}>
        <Form.Label>Date</Form.Label>
        <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} />
      </Form.Group>

      {!route && <Alert variant="info">You don't have an assigned route yet.</Alert>}

      {route && (
        <Card>
          <Card.Body>
            <Card.Title>{route.name}</Card.Title>
            <Table striped bordered hover responsive>
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
                          <Badge
                            bg={
                              existing.status === 'present'
                                ? 'success'
                                : existing.status === 'absent'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {existing.status}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Not marked</Badge>
                        )}
                      </td>
                      <td className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-success"
                          disabled={!!existing || submittingId === c._id}
                          onClick={() => handleMark(c._id, 'present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={!!existing || submittingId === c._id}
                          onClick={() => handleMark(c._id, 'absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          disabled={!!existing || submittingId === c._id}
                          onClick={() => handleMark(c._id, 'leave')}
                        >
                          Leave
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {commuters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No riders on your route
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}