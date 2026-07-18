import api from './api';

export const fetchMaterials = async (params) => {
  const res = await api.get('/api/materials', { params });
  return res.data;
};

export const uploadMaterial = async (formData) => {
  const res = await api.post('/api/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteMaterial = async (id) => {
  const res = await api.delete(`/api/materials/${id}`);
  return res.data;
};
