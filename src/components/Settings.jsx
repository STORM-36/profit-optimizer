import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Settings = ({ goBack }) => {
  const { currentUser, workspaceId, userRole } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. ERASE DATA ONLY (Keep Account)
  const handleEraseData = async () => {
    if (userRole !== 'owner') {
      alert('Only owners can access this action.');
      return;
    }

    const confirm = window.prompt("⚠️ DANGER: This will delete ALL your order history.\nType 'DELETE' to confirm.");
    
    if (confirm !== 'DELETE') return;

    setIsDeleting(true);
    try {
      const user = currentUser || auth.currentUser;
      const effectiveWorkspaceId = workspaceId || user?.uid || null;
      if (!user || !effectiveWorkspaceId) return;

      // Find all orders for this workspace
      const q = query(collection(db, "orders"), where("workspaceId", "==", effectiveWorkspaceId));
      const snapshot = await getDocs(q);

      // Delete them one by one
      const deletePromises = snapshot.docs.map(document => 
        deleteDoc(doc(db, "orders", document.id))
      );

      await Promise.all(deletePromises);
      alert("✅ All data has been erased.");
    } catch (error) {
      console.error(error);
      alert("❌ Error erasing data: " + error.message);
    }
    setIsDeleting(false);
  };

  // 2. DELETE ACCOUNT (Nuclear Option)
  const handleDeleteAccount = async () => {
    if (userRole !== 'owner') {
      alert('Only owners can access this action.');
      return;
    }

    const confirm = window.prompt("⛔ FINAL WARNING: This will delete your Account AND Data.\nThis cannot be undone.\n\nType 'DELETE' to confirm.");
    
    if (confirm !== 'DELETE') return;

    setIsDeleting(true);
    try {
      // Step A: Erase Data First
      await handleEraseData(); 

      // Step B: Delete User from Auth
      const user = currentUser || auth.currentUser;
      await deleteUser(user);
      
      alert("👋 Account deleted. Goodbye!");
      // The App.jsx will automatically detect logout
    } catch (error) {
      console.error(error);
      // Firebase requires a recent login to delete an account.
      alert("⚠️ Security requires you to Login again before deleting your account.");
      await signOut(auth);
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-red-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings & Privacy</h2>
        <button onClick={goBack} className="text-gray-500 hover:text-gray-800">
          ← Back to Dashboard
        </button>
      </div>

      <div className="space-y-6">
        {userRole !== 'owner' ? (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
            <h3 className="font-bold text-yellow-800 text-lg">Owner Access Required</h3>
            <p className="text-sm text-yellow-700 mt-1">Only workspace owners can access Settings actions.</p>
          </div>
        ) : (
          <>
        
        {/* OPTION 1: Erase Data */}
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-xl">
          <h3 className="font-bold text-orange-800 text-lg">🧹 Clear History</h3>
          <p className="text-sm text-orange-700 mt-1">
            Delete all your orders and customers from the database. <br/>
            Your account will remain active.
          </p>
          <button 
            onClick={handleEraseData}
            disabled={isDeleting}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition w-full"
          >
            {isDeleting ? "Processing..." : "Erase All Data"}
          </button>
        </div>

        {/* OPTION 2: Delete Account */}
        <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
          <h3 className="font-bold text-red-800 text-lg">💣 Delete Account</h3>
          <p className="text-sm text-red-700 mt-1">
            Permanently delete your account and all data. <br/>
            <strong>This action is irreversible.</strong>
          </p>
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition w-full"
          >
            {isDeleting ? "Goodbye..." : "Delete My Account"}
          </button>
        </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Settings;