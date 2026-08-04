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

export const fetchAdminCardVisibility = async () => {
  const res = await api.get('/api/auth/admin-card-visibility');
  return res.data;
};

export const updateAdminCardVisibility = async (visible) => {
  const res = await api.post('/api/auth/admin-card-visibility', { visible });
  return res.data;
};

export const fetchInstructorCardVisibility = async () => {
  const res = await api.get('/api/auth/instructor-card-visibility');
  return res.data;
};

export const updateInstructorCardVisibility = async (visible) => {
  const res = await api.post('/api/auth/instructor-card-visibility', { visible });
  return res.data;
};

export const fetchStudentCardVisibility = async () => {
  const res = await api.get('/api/auth/student-card-visibility');
  return res.data;
};

export const updateStudentCardVisibility = async (visible) => {
  const res = await api.post('/api/auth/student-card-visibility', { visible });
  return res.data;
};

export const enrollUserInCourse = async (userId, courseId) => {
  const res = await api.post('/api/admin/enroll', { userId, courseId });
  return res.data;
};

export const unenrollUserFromCourse = async (userId, courseId) => {
  const res = await api.post('/api/admin/unenroll', { userId, courseId });
  return res.data;
};
