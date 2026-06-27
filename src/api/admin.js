import axios from 'axios';
import { getAdminToken } from './adminSession';

const baseURL = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_URL_MAIN || 'http://localhost:5000/api');

const adminApi = axios.create({
    baseURL,
    timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) {
        config.headers['X-Admin-Token'] = token;
    }
    return config;
});

export async function adminLogin(username, password) {
    const res = await axios.post(`${baseURL}/admin/login`, { username, password });
    return res.data;
}

export async function getAdminUsers() {
    const res = await adminApi.get('/admin/users');
    return res.data.users;
}

export async function grantUserAccess(uid, planId) {
    const res = await adminApi.post(`/admin/users/${uid}/grant`, { planId });
    return res.data;
}

export async function revokeUserAccess(uid) {
    const res = await adminApi.post(`/admin/users/${uid}/revoke`);
    return res.data;
}

export async function getPendingRequests() {
    const res = await adminApi.get('/admin/requests');
    return res.data.requests;
}

export async function approveRequest(requestId, planId) {
    const res = await adminApi.post(`/admin/requests/${requestId}/approve`, { planId });
    return res.data;
}

export default adminApi;
