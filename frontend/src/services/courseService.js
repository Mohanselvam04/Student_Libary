import api from './api';

export const fetchCourses = async (params) => {
  const res = await api.get('/api/courses', { params });
  return res.data;
};

export const fetchMyCourses = async () => {
  const res = await api.get('/api/courses/my');
  return res.data;
};

export const getCourseById = async (id) => {
  const res = await api.get(`/api/courses/${id}`);
  return res.data;
};

export const enrollInCourse = async (courseId) => {
  const res = await api.post(`/api/courses/${courseId}/enroll`);
  return res.data;
};

export const createCourse = async (courseData) => {
  const res = await api.post('/api/courses', courseData);
  return res.data;
};

export const updateCourse = async (id, courseData) => {
  const res = await api.put(`/api/courses/${id}`, courseData);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.delete(`/api/courses/${id}`);
  return res.data;
};
