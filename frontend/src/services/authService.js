import api from './api';

export const fetchUserProfile = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

export const localLogin = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const postFirebaseLogin = async (idToken) => {
  const res = await api.post('/api/auth/firebase-login', { idToken });
  return res.data;
};

export const postFirebaseRegister = async (idToken, name, role) => {
  const res = await api.post('/api/auth/firebase-register', { idToken, name, role });
  return res.data;
};

export const fetchRedirectUrl = async () => {
  const res = await api.get('/api/auth/redirect');
  return res.data;
};

export const verifyResetCode = async (oobCode) => {
  const res = await api.post('/api/auth/verify-reset-code', { oobCode });
  return res.data;
};

export const confirmResetPassword = async (oobCode, newPassword) => {
  const res = await api.post('/api/auth/confirm-reset-password', { oobCode, newPassword });
  return res.data;
};
