import api from './api';

export const fetchAdminStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const fetchAllUsers = async () => {
  const res = await api.get('/api/admin/users');
  return res.data;
};

export const fetchAllCourses = async () => {
  const res = await api.get('/api/admin/courses');
  return res.data;
};

export const updateUserInfo = async (id, updates) => {
  const res = await api.put(`/api/admin/users/${id}`, updates);
  return res.data;
};

export const deleteUserById = async (id) => {
  const res = await api.delete(`/api/admin/users/${id}`);
  return res.data;
};

export const toggleCourseStatus = async (id) => {
  const res = await api.patch(`/api/admin/courses/${id}/toggle`);
  return res.data;
};
