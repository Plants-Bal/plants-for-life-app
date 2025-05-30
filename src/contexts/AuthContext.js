import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
    getAuth, // Assuming 'auth' instance is passed or imported
    onAuthStateChanged,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInWithCustomToken // If used in your specific environment
} from 'firebase/auth';

// You would typically import 'auth' from your firebase.js setup file
// For example: import { auth } from './firebase'; 
// And ADMIN_UID_PLACEHOLDER from a constants file or directly define it
// For example: import { ADMIN_UID_PLACEHOLDER } from '../constants';

// For this example, let's assume 'auth' is passed as a prop or accessible globally
// This is a simplification for showing AuthContext.js in isolation.
// In a real multi-file setup, 'auth' would come from your Firebase initialization file.

// Placeholder for where ADMIN_UID_PLACEHOLDER would be defined or imported
const ADMIN_UID_PLACEHOLDER = "REPLACE_WITH_YOUR_ADMIN_FIREBASE_UID"; 
// Placeholder for the Firebase Auth instance. In a real app, import this.
const auth = getAuth(); // This line assumes Firebase app is already initialized elsewhere.

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (authError) setAuthError(null); 
      if (user) {
        setCurrentUser(user);
        setUserId(user.uid);
        // console.log("User detected:", user.uid, "Is Anonymous:", user.isAnonymous);
        if (user.uid === ADMIN_UID_PLACEHOLDER) {
          setIsAdmin(true);
          // console.log("Admin user detected.");
        } else {
          setIsAdmin(false);
          // console.log("Regular user detected.");
        }
      } else {
        // console.log("No user signed in, attempting fallback sign in.");
        try {
            // The __initial_auth_token logic is specific to some development environments.
            // For a general deployment, this part might be removed or handled differently.
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                // console.log("Attempting sign in with custom token.");
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                // console.log("Attempting anonymous sign in as default.");
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Fallback sign-in error:", error);
            setAuthError(error.message); 
            setCurrentUser(null); 
            setIsAdmin(false); 
            setUserId(null);
        }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // authError removed from deps as per previous fix attempt logic, can be re-evaluated.

  const signUpUser = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setIsLoadingAuth(false);
      return userCredential.user;
    } catch (error) {
      console.error("Signup Error:", error);
      setAuthError(error.message);
      setIsLoadingAuth(false);
      return null;
    }
  };

  const logInUser = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoadingAuth(false);
      return userCredential.user;
    } catch (error) {
      console.error("Login Error:", error);
      setAuthError(error.message);
      setIsLoadingAuth(false);
      return null;
    }
  };

  const logOutUser = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle signing in anonymously after logout
    } catch (error) {
      console.error("Logout Error:", error);
      setAuthError(error.message);
    } finally {
        setIsLoadingAuth(false); 
    }
  };

  const contextValue = {
    currentUser,
    isAdmin,
    isLoadingAuth,
    userId,
    authError,
    signUpUser,
    logInUser,
    logOutUser,
    setAuthError // To allow components to clear auth errors
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Optional: Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};