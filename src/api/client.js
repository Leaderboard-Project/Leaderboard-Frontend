import axios from 'axios';

const defaultBaseURL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://leaderboard-backend-oihj.onrender.com';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
