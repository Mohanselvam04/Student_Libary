import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => { 
          localStorage.removeItem('lms_token'); 
          delete axios.defaults.headers.common['Authorization']; 
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const res = await axios.post('/api/auth/firebase-login', { idToken });
    const { user: backendUser, token } = res.data;
    
    localStorage.setItem('lms_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(backendUser);
    return backendUser;
  };

  const register = async (data) => {
    const { name, email, password, role } = data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const res = await axios.post('/api/auth/firebase-register', { idToken, name, role });
    const { user: backendUser, token } = res.data;

    localStorage.setItem('lms_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(backendUser);
    return backendUser;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('lms_token');
    delete axios.defaults.headers.common['Authorization'];
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

