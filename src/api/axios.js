import axios from 'axios';
import { auth } from '../auth/firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_MAIN || 'http://localhost:5000/api',
});

export const biometricsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL_BIO || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

biometricsApi.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
