import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getBots = () => api.get('/bots');
export const createBot = (data: any) => api.post('/bots', data);
export const chatWithBot = (data: any) => api.post('/ai/chat', data);
