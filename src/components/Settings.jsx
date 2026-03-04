import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase';
import { logAudit } from '../utils/auditLogger';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    shopName: '',
    phone: ''
  });

  useEffect(() => {
    if (!currentUser) return;

    setFormData({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      shopName: currentUser?.shopName || '',
      phone: currentUser?.phone || ''
    });
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, formData);

      if (currentUser) {
        try {
          await logAudit(
            currentUser.workspaceId,
            currentUser,
            'UPDATED_PROFILE',
            'Updated account profile details'
          );
        } catch (err) {
          console.error(err);
        }
      }

      setIsEditing(false);
      alert('Profile saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Database Save Error:', error);
      alert('Failed to save profile: ' + error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      alert('No email found for this account.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('Unable to send password reset email right now.');
    }
  };

  const handleFieldChange = (field) => (event) => {
    setFormData((previousForm) => ({
      ...previousForm,
      [field]: event.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Account & Workspace Settings</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Profile Details</h2>
          <button
            onClick={() => setIsEditing((previousState) => !previousState)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</p>
              <p className="text-slate-800 font-semibold mt-1">
                {[formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shop Name</p>
              <p className="text-slate-800 font-semibold mt-1">{formData.shopName || currentUser?.shopName || 'Shop Admin'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
              <p className="text-slate-800 font-semibold mt-1">{currentUser?.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone Number</p>
              <p className="text-slate-800 font-semibold mt-1">{formData.phone || 'Not set'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={handleFieldChange('firstName')}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={handleFieldChange('lastName')}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shop Name</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={handleFieldChange('shopName')}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={handleFieldChange('phone')}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSaveProfile}
                className="mt-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Team & Permissions</h2>
        <p className="text-slate-500 mt-2">Manage your employees, operators, and workspace access.</p>
        <Link
          to="/team"
          className="inline-block mt-4 bg-indigo-50 text-indigo-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Open Team Management
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-200"
          >
            Log Out
          </button>
          <button
            onClick={handlePasswordReset}
            className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-200"
          >
            Reset Password
          </button>
        </div>

        <div className="mt-8 border border-red-200 bg-red-50 p-5 rounded-xl">
          <h3 className="text-lg font-bold text-red-700">Danger Zone</h3>
          <p className="text-sm text-red-600 mt-2">
            Terminating your account will permanently remove your workspace access and cannot be undone.
          </p>
          <button
            onClick={() => window.confirm('Are you sure? This action is permanent and cannot be undone.')}
            className="mt-4 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700"
          >
            Terminate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;