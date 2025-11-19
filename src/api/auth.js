import { createApiClient } from './http';

const authClient = createApiClient('http://localhost:8081');

export const register = (payload) => authClient.post('/auth/register', payload);
export const login = (payload) => authClient.post('/auth/login', payload);
export const validateToken = () => authClient.get('/auth/validate');
export const fetchAuthUserById = (id) => authClient.get(`/auth/user/${id}`);