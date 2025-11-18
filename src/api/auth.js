import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' }
});

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export const register = (payload) => client.post('/auth/register', payload);
export const login = (payload) => client.post('/auth/login', payload);
export const validate = () => client.get('/auth/validate');