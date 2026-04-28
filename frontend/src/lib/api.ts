import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aichataz.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getBots = () => api.get('/bots');
export const createBot = (data: any) => api.post('/bots', data);
export const updateBot = (id: string, data: any) => api.put(`/bots/${id}`, data);
export const getLogs = () => api.get('/bots/logs');

export const getInstagramAuthUrl = (botId: string) => 
  `${API_URL}/auth/instagram/start?bot_id=${botId}`;
