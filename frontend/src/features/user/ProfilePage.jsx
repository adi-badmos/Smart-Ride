import { useState } from 'react';
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
    <div className="sr-col-2">
      <div className="sr-card">
        <h3 className="sr-card-title">Profile</h3>
        {profileMsg.text && (
          <div className={`sr-alert sr-alert-${profileMsg.type}`}>
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={submitProfile}>
          <div className="sr-form-group">
            <label className="sr-label">Email</label>
            <input className="sr-input" value={user.email} disabled />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Name</label>
            <input
              className="sr-input"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">Phone</label>
            <input
              className="sr-input"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              required
            />
          </div>
          <button type="submit" className="sr-btn sr-btn-primary" disabled={profileSubmitting}>
            {profileSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="sr-card">
        <h3 className="sr-card-title">Change Password</h3>
        {pwMsg.text && (
          <div className={`sr-alert sr-alert-${pwMsg.type}`}>
            {pwMsg.text}
          </div>
        )}
        <form onSubmit={submitPassword}>
          <div className="sr-form-group">
            <label className="sr-label">Current Password</label>
            <input
              className="sr-input"
              type="password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              required
            />
          </div>
          <div className="sr-form-group">
            <label className="sr-label">New Password</label>
            <input
              className="sr-input"
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="sr-btn sr-btn-primary" disabled={pwSubmitting}>
            {pwSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}