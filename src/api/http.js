import axios from 'axios';

const getToken = () => localStorage.getItem('token');

export const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};