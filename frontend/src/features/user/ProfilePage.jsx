import { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateProfileRequest, changePasswordRequest } from './userService.js';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  if (loading || !user) return null;

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileSubmitting(true);
    try {
      await updateProfileRequest(profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.error?.message || 'Update failed' });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    setPwSubmitting(true);
    try {
      await changePasswordRequest(pwForm);
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'danger', text: err.response?.data?.error?.message || 'Password change failed' });
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <Row className="g-4">
      <Col md={6}>
        <Card>
          <Card.Body>
            <Card.Title>Profile</Card.Title>
            {profileMsg.text && <Alert variant={profileMsg.type}>{profileMsg.text}</Alert>}
            <Form onSubmit={submitProfile}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control value={user.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" value={profileForm.name} onChange={handleProfileChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control name="phone" value={profileForm.phone} onChange={handleProfileChange} required />
              </Form.Group>
              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card>
          <Card.Body>
            <Card.Title>Change Password</Card.Title>
            {pwMsg.text && <Alert variant={pwMsg.type}>{pwMsg.text}</Alert>}
            <Form onSubmit={submitPassword}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  minLength={8}
                  required
                />
              </Form.Group>
              <Button type="submit" disabled={pwSubmitting}>
                {pwSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}