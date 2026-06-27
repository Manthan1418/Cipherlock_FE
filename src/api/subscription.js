import api from './axios';

export async function getPlans() {
    const res = await api.get('/subscription/plans');
    return res.data.plans;
}

export async function getMySubscription() {
    const res = await api.get('/subscription/my');
    return res.data;
}

export async function requestSubscription(planId) {
    const res = await api.post('/subscription/subscribe', { planId });
    return res.data;
}

export async function checkLimit() {
    const res = await api.get('/subscription/check-limit');
    return res.data;
}

export async function getAdminUsers() {
    const res = await api.get('/admin/users');
    return res.data.users;
}

export async function grantUserAccess(uid, planId) {
    const res = await api.post(`/admin/users/${uid}/grant`, { planId });
    return res.data;
}

export async function revokeUserAccess(uid) {
    const res = await api.post(`/admin/users/${uid}/revoke`);
    return res.data;
}

export async function getPendingRequests() {
    const res = await api.get('/admin/requests');
    return res.data.requests;
}

export async function approveRequest(requestId, planId) {
    const res = await api.post(`/admin/requests/${requestId}/approve`, { planId });
    return res.data;
}
