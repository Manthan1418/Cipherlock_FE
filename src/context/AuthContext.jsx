import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { auth } from "../auth/firebase";
import api, { biometricsApi } from '../api/axios';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signOut
} from "firebase/auth";
import { deriveKey } from "../crypto/vaultCrypto";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    // Keep key material in memory only.
    const [dbKey, setDbKey] = useState(null);
    const [legacyKeys, setLegacyKeys] = useState([]);
    const [twoFactorVerified, _setTwoFactorVerified] = useState(() => {
        return sessionStorage.getItem('twoFactorVerified') === 'true';
    });

    // Wrapper that also persists to sessionStorage
    const setTwoFactorVerified = useCallback((value) => {
        _setTwoFactorVerified(value);
        if (value) {
            sessionStorage.setItem('twoFactorVerified', 'true');
        } else {
            sessionStorage.removeItem('twoFactorVerified');
            sessionStorage.removeItem('twoFactorSession');
        }
    }, []);

    const getKdfSalt = useCallback(async () => {
        const res = await api.post('/auth/kdf-salt');
        if (!res?.data?.salt) {
            throw new Error('Unable to initialize key derivation salt');
        }
        return res.data.salt;
    }, []);

    const deriveLegacyKeys = useCallback(async (password, user, emailHint = null) => {
        const salts = [];

        const addSalt = (value) => {
            if (!value || typeof value !== 'string') return;
            if (!salts.includes(value)) salts.push(value);
        };

        const email = user?.email || emailHint;
        if (email) {
            addSalt(email);
            addSalt(email.trim());
            addSalt(email.toLowerCase());
            addSalt(email.trim().toLowerCase());
        }

        if (user?.uid) {
            addSalt(user.uid);
        }

        if (salts.length === 0) return [];

        const keys = await Promise.all(salts.map((salt) => deriveKey(password, salt)));
        return keys;
    }, []);

    // Wake up the Render backend (biometrics) to mitigate cold starts
    useEffect(() => {
        if (import.meta.env.DEV) return;

        // Fire and forget in production to reduce initial perceived latency on first biometrics call.
        void biometricsApi.get('/biometrics/health').catch(() => {});
    }, []);

    async function check2FAStatus() {
        try {
            const res = await api.get('/auth/2fa/status');
            if (res.data.enabled) {
                setTwoFactorVerified(false);
            } else {
                setTwoFactorVerified(true);
            }
        } catch (err) {
            console.error("Failed to check 2FA status", err);
            // Default to verified if error? No, fail secure.
            // But if it's network error on login... 
            // Let's assume false for security.
            setTwoFactorVerified(false);
        }
    }

    // Check 2FA Status when user logs in
    useEffect(() => {
        if (currentUser) {
            // If already verified this session (e.g. page reload), skip the check
            if (sessionStorage.getItem('twoFactorVerified') === 'true') {
                _setTwoFactorVerified(true);
            } else {
                check2FAStatus();
            }
        } else if (currentUser === null) {
            // Only clear on confirmed logout (null from onAuthStateChanged),
            // NOT on initial mount when currentUser is still undefined.
            setTwoFactorVerified(false);
        }
    }, [currentUser, setTwoFactorVerified]);

    const signup = useCallback((email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
            .then(async (cred) => {
                const kdfSalt = await getKdfSalt();
                const key = await deriveKey(password, kdfSalt);
                setDbKey(key);
                setLegacyKeys([]);
                setTwoFactorVerified(true); // New users don't have 2FA yet
                return cred;
            });
    }, [getKdfSalt, setTwoFactorVerified]);

    const login = useCallback((email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
            .then(async (cred) => {
                const kdfSalt = await getKdfSalt();
                const key = await deriveKey(password, kdfSalt);
                const fallbackKeys = await deriveLegacyKeys(password, cred?.user, email);
                setDbKey(key);
                setLegacyKeys(fallbackKeys);
                // 2FA status check happens in useEffect
                return cred;
            });
    }, [deriveLegacyKeys, getKdfSalt]);

    const logout = useCallback(() => {
        setDbKey(null);
        setLegacyKeys([]);
        sessionStorage.removeItem('lastActiveTime'); // Clear activity timer too
        sessionStorage.removeItem('twoFactorVerified');
        sessionStorage.removeItem('twoFactorSession');
        setTwoFactorVerified(false);
        return signOut(auth);
    }, [setTwoFactorVerified]);

    const resetPassword = useCallback((email) => {
        return sendPasswordResetEmail(auth, email);
    }, []);

    // ==========================================
    // BIOMETRIC AUTH METHODS
    // ==========================================

    const enableBiometrics = useCallback(async () => {
        if (!currentUser || !dbKey) throw new Error("Must be logged in to enable biometrics");

        try {
            // 1. Register Credential
            const { default: apiWebAuthn } = await import('../api/webauthn');
            await apiWebAuthn.registerBiometrics();

            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }, [currentUser, dbKey]);

    const loginWithBiometrics = useCallback(async (email = null) => {
        try {
            const { default: apiWebAuthn } = await import('../api/webauthn');

            // For discoverable credentials, we don't need a UID. The authenticator provides it.
            // Passkey assertion options will be fetched generically.
            const result = await apiWebAuthn.loginWithBiometrics(email, null);

            if (result.verified && result.token) {
                // 1. Sign in with Firebase (using custom token from backend)
                const { signInWithCustomToken } = await import("firebase/auth");
                await signInWithCustomToken(auth, result.token);

                if (result.twoFactorSession) {
                    sessionStorage.setItem('twoFactorSession', result.twoFactorSession);
                }

                // Biometric login authenticates the user but does not restore the vault key in storage.
                setDbKey(null);
                setLegacyKeys([]);

                setTwoFactorVerified(true);
                return true;
            } else {
                throw new Error("Verification failed: Invalid response from server");
            }
        } catch (e) {
            console.error("Biometric Login Failed:", e);
            throw e;
        }
    }, [setTwoFactorVerified]);

    const unlockVault = useCallback(async (masterPassword) => {
        if (!currentUser) {
            throw new Error('No authenticated user found. Please login again.');
        }
        if (!masterPassword || !masterPassword.trim()) {
            throw new Error('Master password is required.');
        }

        const kdfSalt = await getKdfSalt();
        const key = await deriveKey(masterPassword, kdfSalt);
        const fallbackKeys = await deriveLegacyKeys(masterPassword, currentUser, currentUser?.email || null);

        setDbKey(key);
        setLegacyKeys(fallbackKeys);
        return true;
    }, [currentUser, deriveLegacyKeys, getKdfSalt]);

    const value = useMemo(() => ({
        currentUser,
        dbKey,
        legacyKeys,
        setDbKey, // helper if we implement "Unlock" screen
        twoFactorVerified,
        setTwoFactorVerified,
        signup,
        login,
        logout,
        resetPassword,
        enableBiometrics,
        loginWithBiometrics,
        unlockVault
    }), [
        currentUser,
        dbKey,
        legacyKeys,
        twoFactorVerified,
        setTwoFactorVerified,
        signup,
        login,
        logout,
        resetPassword,
        enableBiometrics,
        loginWithBiometrics,
        unlockVault
    ]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            // If user is logged in but dbKey is null (e.g. refresh), 
            // app should redirect to an "Unlock Vault" screen or just force re-login.
            // We'll handle this in the protected route logic.
        });

        return unsubscribe;
    }, []);

    // Auto-Logout Timer (5 Minutes) with Persistence
    useEffect(() => {
        if (!currentUser) return;

        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
        const STORAGE_KEY = 'lastActiveTime';

        const logoutUser = () => {
            console.log("Auto-logout triggered due to inactivity.");
            logout();
            localStorage.removeItem(STORAGE_KEY);
        };

        const updateActivity = () => {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        };

        // Initialize if not set
        if (!localStorage.getItem(STORAGE_KEY)) {
            updateActivity();
        }

        // Check activity periodically
        const checkActivity = () => {
            const lastActive = parseInt(localStorage.getItem(STORAGE_KEY) || Date.now().toString());
            const now = Date.now();
            if (now - lastActive >= TIMEOUT_MS) {
                logoutUser();
            }
        };

        // Check immediately on mount/focus
        checkActivity();

        // Check every minute (or less if you want more precision)
        const intervalId = setInterval(checkActivity, 60 * 1000); // Check every minute

        // Listen for user activity
        const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];

        // Throttled update to avoid spamming localStorage
        let throttleTimer;
        const handleActivity = () => {
            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    updateActivity();
                    throttleTimer = null;
                }, 1000); // Only update once per second max
            }
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            clearInterval(intervalId);
            if (throttleTimer) clearTimeout(throttleTimer);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [currentUser, logout]);





    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-indigo-500">
                    <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
