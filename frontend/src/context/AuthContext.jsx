import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
