import axios from 'axios';
import { auth } from '../auth/firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_MAIN || 'http://localhost:8080/api/v1',
    timeout: 15000,
});

export const biometricsApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL_BIO || 'http://localhost:8080/api/v1',
    timeout: 15000,
});

let tokenPromise = null;

async function getCachedIdToken(user) {
    if (!tokenPromise) {
        tokenPromise = user.getIdToken().finally(() => {
            tokenPromise = null;
        });
    }
    return tokenPromise;
}

function attachAuthInterceptor(client) {
    client.interceptors.request.use(async (config) => {
        if (config.headers?.Authorization) {
            return config;
        }

        const user = auth.currentUser;
        if (user) {
            const token = await getCachedIdToken(user);
            config.headers.Authorization = `Bearer ${token}`;
        }

        const twoFactorSession = sessionStorage.getItem('twoFactorSession');
        if (twoFactorSession) {
            config.headers['X-2FA-Session'] = twoFactorSession;
        }

        return config;
    }, (error) => Promise.reject(error));
}

attachAuthInterceptor(api);
attachAuthInterceptor(biometricsApi);

export default api;
