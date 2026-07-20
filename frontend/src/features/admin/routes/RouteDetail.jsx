import { Card, Badge, Table } from 'react-bootstrap';
import MapView from '../../../components/MapView.jsx';

export default function RouteDetail({ route }) {
  if (!route) return null;

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          {route.name} <Badge bg={route.status === 'active' ? 'success' : 'secondary'}>{route.status}</Badge>
        </Card.Title>
        <p className="text-muted mb-3">{route.city}</p>

        <Table borderless size="sm" className="mb-3">
          <tbody>
            <tr>
              <td>
                <strong>Driver</strong>
              </td>
              <td>{route.driver?.user?.name || 'Unassigned'}</td>
            </tr>
            <tr>
              <td>
                <strong>Vehicle</strong>
              </td>
              <td>{route.vehicle?.registrationNumber || 'Unassigned'}</td>
            </tr>
            <tr>
              <td>
                <strong>Schedule</strong>
              </td>
              <td>
                {route.schedule.departureTime} → {route.schedule.arrivalTime} (
                {route.schedule.operatingDays.join(', ').toUpperCase()})
              </td>
            </tr>
            <tr>
              <td>
                <strong>Capacity</strong>
              </td>
              <td>{route.capacity}</td>
            </tr>
          </tbody>
        </Table>

        <MapView
          pickupPoints={route.pickupPoints}
          destinationAddress={route.destination.address}
          destinationCoordinates={route.destination.coordinates}
        />
      </Card.Body>
    </Card>
  );
}