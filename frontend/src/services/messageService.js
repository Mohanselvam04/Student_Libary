import api from './api';

export const fetchConversations = async () => {
  const res = await api.get('/api/messages/conversations');
  return res.data;
};

export const fetchUsers = async () => {
  const res = await api.get('/api/messages/users');
  return res.data;
};

export const fetchMessages = async (userId) => {
  const res = await api.get(`/api/messages/${userId}`);
  return res.data;
};

export const triggerAiChat = async (messages) => {
  const res = await api.post('/api/ai/chat', { messages });
  return res.data;
};
