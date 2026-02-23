import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, secondaryAuth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const TeamManagement = () => {
  const { currentUser, userRole, workspaceId } = useAuth();
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(true);

  const effectiveWorkspaceId = useMemo(
    () => workspaceId || currentUser?.uid || null,
    [workspaceId, currentUser]
  );

  const loadEmployees = async () => {
    if (!effectiveWorkspaceId) {
      setEmployees([]);
      setLoadingEmployees(false);
      return;
    }

    setLoadingEmployees(true);
    try {
      const employeesQuery = query(
        collection(db, 'users'),
        where('workspaceId', '==', effectiveWorkspaceId),
        where('role', '==', 'operator')
      );

      const employeeSnapshot = await getDocs(employeesQuery);
      const employeeRows = employeeSnapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data()
      }));

      employeeRows.sort((firstRow, secondRow) => {
        const firstTime = firstRow?.createdAt?.seconds || 0;
        const secondTime = secondRow?.createdAt?.seconds || 0;
        return secondTime - firstTime;
      });

      setEmployees(employeeRows);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!effectiveWorkspaceId) {
      setAuditLogs([]);
      setLoadingAudit(false);
      return;
    }

    setLoadingAudit(true);
    try {
      const auditQuery = query(
        collection(db, 'audit_logs'),
        where('workspaceId', '==', effectiveWorkspaceId),
        orderBy('timestamp', 'desc')
      );

      const auditSnapshot = await getDocs(auditQuery);
      const auditRows = auditSnapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data()
      }));

      setAuditLogs(auditRows);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (userRole !== 'owner') {
      setLoadingEmployees(false);
      setLoadingAudit(false);
      return;
    }

    loadEmployees();
    loadAuditLogs();
  }, [userRole, effectiveWorkspaceId]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const parsedDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return parsedDate.toLocaleString('en-GB');
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    if (!employeeEmail.trim() || !tempPassword.trim()) {
      alert('Please provide employee email and temporary password.');
      return;
    }

    if (!effectiveWorkspaceId) {
      alert('Workspace is not available for this user yet.');
      return;
    }

    setSubmitting(true);
    try {
      const createdUserCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        employeeEmail.trim(),
        tempPassword.trim()
      );

      const newEmployeeUser = createdUserCredential.user;

      await setDoc(doc(db, 'users', newEmployeeUser.uid), {
        email: employeeEmail.trim(),
        role: 'operator',
        workspaceId: effectiveWorkspaceId,
        createdAt: serverTimestamp()
      });

      await signOut(secondaryAuth);

      setEmployeeEmail('');
      setTempPassword('');
      alert('Employee account created successfully.');

      await loadEmployees();
    } catch (error) {
      console.error('Error creating employee account:', error);
      alert(error?.message || 'Failed to create employee account.');
      try {
        await signOut(secondaryAuth);
      } catch (signOutError) {
        console.error('Secondary auth sign-out error:', signOutError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAccess = async (employeeId, email) => {
    if (!window.confirm(`Revoke access for ${email}?`)) return;

    try {
      await updateDoc(doc(db, 'users', employeeId), {
        role: 'revoked',
        status: 'disabled'
      });
      setEmployees((previousEmployees) =>
        previousEmployees.filter((employee) => employee.id !== employeeId)
      );
    } catch (error) {
      console.error('Error revoking employee access:', error);
      alert('Failed to revoke access.');
    }
  };

  if (userRole !== 'owner') {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-6xl mx-auto mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Team Management</h2>
        <p className="text-gray-500">You are not authorized to access this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-6xl mx-auto mt-6 space-y-8">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">👥 Team Management</h2>
        <p className="text-xs text-gray-400">Manage operators and monitor workspace activity.</p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Add Employee</h3>
        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            value={employeeEmail}
            onChange={(event) => setEmployeeEmail(event.target.value)}
            placeholder="Employee Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            value={tempPassword}
            onChange={(event) => setTempPassword(event.target.value)}
            placeholder="Temporary Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Employee List</h3>
        {loadingEmployees ? (
          <p className="text-gray-500">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="text-gray-500">No operators found for this workspace.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="text-left p-3 border-b font-bold">Email</th>
                  <th className="text-left p-3 border-b font-bold">Created</th>
                  <th className="text-center p-3 border-b font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-700">{employee.email}</td>
                    <td className="p-3 text-gray-600">{formatTimestamp(employee.createdAt)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRevokeAccess(employee.id, employee.email)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded font-bold hover:bg-red-700 transition"
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-3">System Audit Trail</h3>
        {loadingAudit ? (
          <p className="text-gray-500">Loading audit trail...</p>
        ) : auditLogs.length === 0 ? (
          <p className="text-gray-500">No audit logs available for this workspace.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="text-left p-3 border-b font-bold">Action</th>
                  <th className="text-left p-3 border-b font-bold">User</th>
                  <th className="text-left p-3 border-b font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-700">{log.action || '-'}</td>
                    <td className="p-3 text-gray-700">{log.userEmail || log.userId || '-'}</td>
                    <td className="p-3 text-gray-600">{formatTimestamp(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TeamManagement;
