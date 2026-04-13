import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Sparkles, AlertTriangle, UserPlus, LogIn, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';


// ============================================
// ANIMATION CONFIGURATION (Easy to tweak)
// ============================================
const ANIMATION_CONFIG = {
    spring: {
        stiffness: 200,
        damping: 28,
        mass: 0.8,
    },
    duration: {
        primary: 0.5,
        fade: 0.2,
        stagger: 0.03,
    },
    easing: [0.4, 0, 0.2, 1],
};

// ============================================
// FLOATING PARTICLES BACKGROUND
// ============================================
function Particles() {
    return (
        <div className="particles">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="particle" />
            ))}
        </div>
    );
}

// ============================================
// TOP SEMICIRCLE (Login button - visible when on Register)
// ============================================
function TopSemicircle({ isVisible, onSwitch, isAnimating }) {
    const { isDark } = useTheme();
    const handleClick = () => {
        if (!isAnimating && isVisible) {
            onSwitch();
        }
    };

    return (
        <motion.div
            className="absolute inset-x-0 top-0 overflow-hidden"
            initial={false}
            animate={{
                height: isVisible ? '60px' : '0px',
                opacity: isVisible ? 1 : 0,
            }}
            transition={{
                type: 'spring',
                ...ANIMATION_CONFIG.spring,
            }}
            style={{ zIndex: 25 }}
        >
            <svg
                className="absolute top-0 w-full pointer-events-none"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                style={{
                    height: '100%',
                    minHeight: '60px',
                    transform: 'scaleY(-1)',
                }}
            >
                <defs>
                    <linearGradient id="topSemicircleGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.95)" />
                        <stop offset="100%" stopColor="rgba(79, 70, 229, 0.98)" />
                    </linearGradient>
                    <filter id="topSemicircleShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)" />
                    </filter>
                </defs>
                <ellipse
                    cx="50"
                    cy="50"
                    rx="70"
                    ry="50"
                    fill="url(#topSemicircleGradient)"
                    filter={isDark ? "url(#topSemicircleShadow)" : "none"}
                />
            </svg>
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"
                animate={{
                    opacity: isVisible ? 0.3 : 0,
                }}
                transition={{ duration: ANIMATION_CONFIG.duration.fade }}
            />
            {/* Clickable button area */}
            <button
                type="button"
                onClick={handleClick}
                disabled={isAnimating || !isVisible}
                className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-center cursor-pointer bg-transparent border-none hover:transition-colors duration-200 disabled:cursor-default"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 0.15, delay: isVisible ? 0.05 : 0 }}
                    className="text-white font-semibold text-sm tracking-wide flex items-center gap-2 select-none"
                    style={{ marginTop: '8px' }}
                >
                    <LogIn className="w-4 h-4" />
                    Login
                </motion.span>
            </button>
        </motion.div>
    );
}

// ============================================
// BOTTOM SEMICIRCLE (Register button - visible when on Login)
// ============================================
function BottomSemicircle({ isVisible, onSwitch, isAnimating }) {
    const { isDark } = useTheme();
    const handleClick = () => {
        if (!isAnimating && isVisible) {
            onSwitch();
        }
    };

    return (
        <motion.div
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            initial={false}
            animate={{
                height: isVisible ? '60px' : '0px',
                opacity: isVisible ? 1 : 0,
            }}
            transition={{
                type: 'spring',
                ...ANIMATION_CONFIG.spring,
            }}
            style={{ zIndex: 25 }}
        >
            <svg
                className="absolute bottom-0 w-full pointer-events-none"
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                style={{
                    height: '100%',
                    minHeight: '60px',
                }}
            >
                <defs>
                    <linearGradient id="bottomSemicircleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.95)" />
                        <stop offset="100%" stopColor="rgba(79, 70, 229, 0.98)" />
                    </linearGradient>
                    <filter id="bottomSemicircleShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="-4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)" />
                    </filter>
                </defs>
                <ellipse
                    cx="50"
                    cy="50"
                    rx="70"
                    ry="50"
                    fill="url(#bottomSemicircleGradient)"
                    filter={isDark ? "url(#bottomSemicircleShadow)" : "none"}
                />
            </svg>
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent pointer-events-none"
                animate={{
                    opacity: isVisible ? 0.3 : 0,
                }}
                transition={{ duration: ANIMATION_CONFIG.duration.fade }}
            />
            {/* Clickable button area */}
            <button
                type="button"
                onClick={handleClick}
                disabled={isAnimating || !isVisible}
                className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-center cursor-pointer bg-transparent border-none  transition-colors duration-200 disabled:cursor-default"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 0.15, delay: isVisible ? 0.05 : 0 }}
                    className="text-white font-semibold text-sm tracking-wide flex items-center gap-2 select-none"
                    style={{ marginBottom: '8px' }}
                >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                </motion.span>
            </button>
        </motion.div>
    );
}

// ============================================
// ANIMATED BUTTON WITH MICRO-INTERACTIONS
// ============================================
function AnimatedButton({ children, loading, disabled, type = 'submit', onClick }) {
    const { isDark } = useTheme();
    return (
        <motion.button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className="relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            style={{
                '--tw-ring-offset-color': isDark ? '#111827' : '#ffffff'
            }}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-') || 'action'}`}
        >

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                    >
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </motion.span>
                ) : (
                    <motion.span
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                    >
                        {children}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

// ============================================
// ANIMATED INPUT FIELD
// ============================================
function AnimatedInput({ label, type, value, onChange, placeholder, required, delay = 0, icon: Icon, highlight, compact = false }) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: ANIMATION_CONFIG.duration.fade,
                delay,
            }}
            className={highlight ? "pt-3" : ""}
            style={highlight ? { borderTop: '1px solid var(--border-color)' } : {}}
        >
            <label
                className="text-sm font-medium flex items-center"
                style={{ color: highlight ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
                {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                {label}
            </label>
            <input
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`mt-1.5 block w-full px-4 ${compact ? 'py-2.5' : 'py-3'} border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-animated`}
                style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: highlight ? 'var(--accent-primary)' : 'var(--border-input)',
                    '--tw-placeholder-color': 'var(--text-muted)'
                }}
                data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
            />
        </motion.div>
    );
}


// ============================================
// LOGIN FORM CONTENT
// ============================================
function LoginFormContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login, setTwoFactorVerified, loginWithBiometrics, resetPassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const navigate = useNavigate();

    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('cipherlock_remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        async function checkAvailability() {
            try {
                // For discoverable credentials (passkeys synced via Google/Apple/Dashlane), 
                // we should offer the passkey login if the platform supports it at all.
                // We no longer rely on a locally stored UID, allowing cross-device sync to work seamlessly.

                // We use dynamic import so it doesn't break environments without it
                const { browserSupportsWebAuthn } = await import('@simplewebauthn/browser');
                if (browserSupportsWebAuthn()) {
                    setIsBiometricAvailable(true);
                } else {
                    setIsBiometricAvailable(false);
                }
            } catch (err) {
                console.error('Error checking biometric availability:', err);
                setIsBiometricAvailable(false);
            }
        }

        checkAvailability();
    }, []);

    async function handleBiometricLogin() {
        try {
            setLoading(true);
            const success = await loginWithBiometrics(email);
            if (success) {
                toast.success('Signed in with passkey. Your vault opens automatically when the wrapped key is available.');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Biometric authentication cancelled or failed:', err);
            const name = err?.name || '';
            const msg = err?.message || '';

            if (name === 'CrossDeviceOriginError' || msg.toLowerCase().includes('secure public https origin')) {
                toast.error('Cross-device passkeys do not work on localhost. Use a deployed HTTPS URL or an HTTPS tunnel like ngrok, then try again.');
            } else if (name === 'NotAllowedError') {
                // User dismissed the browser prompt
                toast.error('Passkey sign-in was cancelled.');
            } else if (
                name === 'NotFoundError' ||
                msg.toLowerCase().includes('no credentials') ||
                msg.toLowerCase().includes('no passkey') ||
                msg.toLowerCase().includes('not found')
            ) {
                // No passkey registered on this device / account
                toast.error('No passkey found for this account. Please sign in with your password.');
            } else if (name === 'SecurityError') {
                toast.error('Passkey sign-in failed due to a security error. Try again.');
            } else {
                toast.error('Passkey sign-in failed. Please use your password instead.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address first.');
            return;
        }
        try {
            setLoading(true);
            await resetPassword(email);
            toast.success('Reset link sent! Check your inbox (and spam folder).');
            setShowReset(false);
        } catch (err) {
            console.error('Password reset failed:', err);
            const code = err.code;
            if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
                toast.error('No account found with that email address.');
            } else {
                toast.error('Could not send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            if (rememberMe) {
                localStorage.setItem('cipherlock_remembered_email', email);
            } else {
                localStorage.removeItem('cipherlock_remembered_email');
            }
            const statusRes = await api.get('/auth/2fa/status');

            if (statusRes.data.enabled) {
                setLoading(false);
                setShowTwoFactor(true);
                return;
            }

            setTwoFactorVerified(true);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const code = err.code;
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
                toast.error('Incorrect password. Please try again.');
            } else if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
                toast.error('No account found with that email.');
            } else if (code === 'auth/too-many-requests') {
                toast.error('Too many failed attempts. Please wait a moment.');
            } else if (code === 'auth/network-request-failed') {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Sign-in failed. Please check your credentials.');
            }
            setLoading(false);
        }
    }

    async function handleVerify2FA(e) {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post('/auth/2fa/verify', { code: twoFactorCode });
            if (res?.data?.twoFactorSession) {
                sessionStorage.setItem('twoFactorSession', res.data.twoFactorSession);
            }
            setTwoFactorVerified(true);
            toast.success('Identity verified! Welcome back.');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Incorrect code — please check your authenticator app.');
            setLoading(false);
        }
    }

    if (showTwoFactor) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="text-center">
                    <div className="relative inline-block">
                        <Lock className="mx-auto h-12 w-12 text-indigo-400" />
                        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold gradient-text">Two-Factor Auth</h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit code from your authenticator.</p>
                </div>
                <form onSubmit={handleVerify2FA} className="space-y-5">
                    <input
                        type="text"
                        maxLength="6"
                        required
                        className="block w-full px-3 py-4 border rounded-xl text-center tracking-[0.5em] text-2xl transition-all input-animated"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-input)'
                        }}
                        placeholder="000000"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <AnimatedButton loading={loading}>Verify</AnimatedButton>
                </form>
            </motion.div>
        );
    }


    if (showReset) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="text-center">
                    <div className="relative inline-block">
                        <Lock className="mx-auto h-12 w-12 text-indigo-400" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold gradient-text">Reset Password</h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a reset link.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <AnimatedInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        delay={0.05}
                    />
                    <AnimatedButton loading={loading}>Send Reset Link</AnimatedButton>
                    <button
                        type="button"
                        onClick={() => setShowReset(false)}
                        className="w-full text-sm mt-3 hover:underline text-center text-indigo-400"
                    >
                        Back to Login
                    </button>
                </form>
            </motion.div>
        );
    }

    return (
        <motion.div className="space-y-5">
            <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-indigo-400" />
                <h2 className="mt-4 text-3xl font-bold gradient-text">Sign in to Cipherlock</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Secure password management</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatedInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    delay={0.05}
                />
                <div className="flex flex-col gap-1">
                    <AnimatedInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        delay={0.1}
                    />
                    <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-indigo-500 rounded border-gray-600 bg-gray-800 focus:ring-indigo-500 focus:ring-offset-gray-900 transition duration-150 ease-in-out cursor-pointer"
                            />
                            <span className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                Remember me
                            </span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowReset(true)}
                            className="text-xs hover:underline text-indigo-400 transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pt-1 space-y-3"
                >
                    <AnimatedButton loading={loading}>
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                    </AnimatedButton>

                    {isBiometricAvailable && (
                        <button
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border text-base font-semibold rounded-xl text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 focus:outline-none transition-colors duration-200 border-indigo-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-2.6 4.63a4 4 0 1 1-5.36-6.36C2.87 9.54 4.18 9 5.25 9c.28 0 .56.09.81.27m5.94 10.73c2.5-2.12 2.6-3.61 2.6-4.63a2 2 0 0 0-2-2c-1.07 0-2.38.54-3.21 1.27a4 4 0 1 1-5.36-6.36" />
                                <path d="M12 2v20" />
                            </svg>
                            Login with Passkey
                        </button>
                    )}
                </motion.div>
            </form>
        </motion.div>
    );
}

// ============================================
// REGISTER FORM CONTENT
// ============================================
function RegisterFormContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setLoading(true);
            await signup(email, password);
            toast.success('Account created! Your vault is ready.');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const code = err.code;
            if (code === 'auth/email-already-in-use') {
                toast.error('An account with this email already exists.');
            } else if (code === 'auth/weak-password') {
                toast.error('Password is too weak. Use at least 6 characters.');
            } else {
                toast.error('Could not create account. Please try again.');
            }
        }
        setLoading(false);
    }

    return (
        <motion.div className="space-y-5">
            <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-indigo-400" />
                <h2 className="mt-3 text-2xl font-bold gradient-text">Create Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <AnimatedInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    delay={0.05}
                    compact
                />
                <div className="grid grid-cols-2 gap-3">
                    <AnimatedInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        delay={0.1}
                        compact
                    />
                    <AnimatedInput
                        label="Confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        delay={0.1}
                        compact
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <AnimatedButton loading={loading}>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                    </AnimatedButton>
                </motion.div>
            </form>
        </motion.div>
    );
}

// ============================================
// MAIN LOGIN COMPONENT (with animated transition to Register)
// ============================================
export default function Login({ initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [isAnimating, setIsAnimating] = useState(false);
    const { theme, toggleTheme } = useTheme();


    const handleSwitch = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setMode((prev) => (prev === 'login' ? 'register' : 'login'));
        setTimeout(() => {
            setIsAnimating(false);
        }, ANIMATION_CONFIG.duration.primary * 1000 + 100);
    }, [isAnimating]);

    const isRegister = mode === 'register';

    const formVariants = {
        initial: {
            opacity: 0,
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.25,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15,
            },
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center animated-bg px-4 py-8 relative overflow-hidden">
            <Particles />

            {/* Theme Toggle Button */}
            <motion.button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-3 rounded-full glass z-50 transition-all duration-300 hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--text-primary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
            </motion.button>

            <motion.div
                className="relative w-full max-w-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: ANIMATION_CONFIG.easing }}
            >

                <motion.div
                    className="relative z-10 glass rounded-2xl overflow-hidden"
                    animate={{
                        boxShadow: isRegister
                            ? '0 25px 50px -12px rgba(79, 70, 229, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)'
                            : '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(75, 85, 99, 0.2)',
                    }}
                    transition={{ type: 'spring', ...ANIMATION_CONFIG.spring }}
                >
                    {/* Top semicircle - Login (visible when on Register) */}
                    <TopSemicircle isVisible={isRegister} onSwitch={handleSwitch} isAnimating={isAnimating} />

                    {/* Bottom semicircle - Register (visible when on Login) */}
                    <BottomSemicircle isVisible={!isRegister} onSwitch={handleSwitch} isAnimating={isAnimating} />

                    <div className="relative z-20 p-6 sm:p-8" style={{ paddingTop: isRegister ? '70px' : '28px', paddingBottom: !isRegister ? '70px' : '24px' }}>
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.div
                                    key="login"
                                    variants={formVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <LoginFormContent />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    variants={formVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <RegisterFormContent />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    className="absolute -inset-4 rounded-3xl -z-10"
                    animate={{
                        background: isRegister
                            ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
                            : 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                    }}
                    transition={{ duration: 0.6 }}
                />
            </motion.div>
        </div>
    );
}
