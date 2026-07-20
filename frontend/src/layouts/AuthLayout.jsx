import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100">
        <Col xs={11} sm={8} md={5} lg={4} className="mx-auto">
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="mb-4 text-center">Smart Ride</h3>
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
}