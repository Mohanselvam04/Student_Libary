import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';
import { fetchUserProfile, localLogin, postFirebaseLogin, postFirebaseRegister } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      fetchUserProfile()
        .then(userData => setUser(userData))
        .catch(() => { 
          localStorage.removeItem('lms_token'); 
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const resData = await postFirebaseLogin(idToken);
      const { user: backendUser, token } = resData;
      
      localStorage.setItem('lms_token', token);
      setUser(backendUser);
      return backendUser;
    } catch (firebaseErr) {
      console.warn('Firebase login failed, attempting local login fallback...', firebaseErr.message);
      try {
        const resData = await localLogin(email, password);
        const { user: backendUser, token } = resData;
        
        localStorage.setItem('lms_token', token);
        setUser(backendUser);
        return backendUser;
      } catch (localErr) {
        throw new Error(localErr.response?.data?.message || localErr.message || firebaseErr.message);
      }
    }
  };

  const register = async (data) => {
    const { name, email, password, role } = data;
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verifErr) {
        console.warn('Failed to send verification email:', verifErr.message);
      }
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-in-use') {
        console.warn('Email already in use in Firebase, attempting to login and link with MongoDB...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw firebaseErr;
      }
    }
    
    const idToken = await userCredential.user.getIdToken();
    const resData = await postFirebaseRegister(idToken, name, role);
    const { user: backendUser, token } = resData;

    localStorage.setItem('lms_token', token);
    setUser(backendUser);
    return backendUser;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('lms_token');
    setUser(null);
  };

  const resetPassword = async (email) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user is currently signed in to resend verification email.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
