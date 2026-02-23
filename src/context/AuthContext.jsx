import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext({
  currentUser: null,
  userRole: null,
  workspaceId: null,
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);

      if (!user) {
        setUserRole(null);
        setWorkspaceId(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const profile = userSnap.data();

          if (profile?.role === 'revoked') {
            alert('Your access to this workspace has been revoked.');
            await signOut(auth);
            setUserRole(null);
            setWorkspaceId(null);
            return;
          }

          setUserRole(profile?.role || null);
          setWorkspaceId(profile?.workspaceId || null);
        } else {
          const fallbackProfile = {
            email: user.email || '',
            role: 'operator',
            workspaceId: user.uid,
            createdAt: serverTimestamp()
          };

          await setDoc(userRef, fallbackProfile);

          setUserRole(fallbackProfile.role);
          setWorkspaceId(fallbackProfile.workspaceId);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserRole(null);
        setWorkspaceId(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, workspaceId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
