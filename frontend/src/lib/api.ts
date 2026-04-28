import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aichataz.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getBots = () => api.get(`/bots?userId=${localStorage.getItem('userId')}`);
export const createBot = (data: any) => api.post('/bots', { ...data, userId: localStorage.getItem('userId') });
export const updateBot = (id: string, data: any) => api.put(`/bots/${id}`, data);
export const getLogs = () => api.get(`/bots/logs?userId=${localStorage.getItem('userId')}`);

export const getInstagramAuthUrl = (botId: string) => 
  `${API_URL}/auth/instagram/start?bot_id=${botId}`;
