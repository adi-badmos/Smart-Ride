import { Component } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged to the browser console only — no backend error-reporting
    // service is wired up, so this is the extent of visibility for now.
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong on this page</Alert.Heading>
            <p className="mb-3">
              Try reloading — if it keeps happening, it's likely a bug rather than a one-off glitch.
            </p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}