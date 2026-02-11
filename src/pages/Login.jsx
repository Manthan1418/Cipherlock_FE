import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

function Particles() {
    return (
        <div className="particles">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="particle" />
            ))}
        </div>
    );
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Firebase Auth Password
    const [masterPassword, setMasterPassword] = useState(''); // Local Vault Password
    const { login, setTwoFactorVerified } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            // 1. Initial Login (Firebase + Key Derivation)
            await login(email, password, masterPassword);

            // 2. Check 2FA Status
            const statusRes = await api.get('/auth/2fa/status');

            if (statusRes.data.enabled) {
                setLoading(false);
                setShowTwoFactor(true);
                return; // Stop here, wait for code
            }

            // 3. If no 2FA, we are done
            setTwoFactorVerified(true);
            toast.success('Welcome back!');
            navigate('/');

        } catch (err) {
            console.error(err);
            toast.error('Failed to log in. Check your credentials.');
            setLoading(false);
        }
    }

    async function handleVerify2FA(e) {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/auth/2fa/verify', { code: twoFactorCode });

            setTwoFactorVerified(true);
            toast.success('Verified!');
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error('Invalid 2FA Code');
            setLoading(false);
        }
    }

    if (showTwoFactor) {
        return (
            <div className="min-h-screen flex items-center justify-center animated-bg px-4 relative overflow-hidden">
                <Particles />
                <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl glow scale-in relative z-10">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <Lock className="mx-auto h-12 w-12 text-indigo-500 pulse-icon" />
                            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold gradient-text">Two-Factor Auth</h2>
                        <p className="mt-2 text-sm text-gray-400">Enter the 6-digit code from your authenticator app.</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleVerify2FA}>
                        <div>
                            <label className="sr-only">2FA Code</label>
                            <input
                                type="text"
                                maxLength="6"
                                required
                                className="block w-full px-3 py-4 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center tracking-[0.5em] text-2xl input-animated transition-all"
                                placeholder="000000"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-glow group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Verify'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center animated-bg px-4 relative overflow-hidden">
            <Particles />
            <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl glow scale-in relative z-10">
                <div className="text-center">
                    <div className="relative inline-block">
                        <Shield className="mx-auto h-14 w-14 text-indigo-500 shield-bounce" />
                        <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl -z-10"></div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold gradient-text">Sign in to PassMan</h2>
                    <p className="mt-2 text-sm text-gray-400">Secure password management</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                            <label className="text-sm font-medium text-gray-300">Email address</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all placeholder-gray-500"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                            <label className="text-sm font-medium text-gray-300">Account Password (Firebase)</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-700/50 fade-in" style={{ animationDelay: '0.3s' }}>
                            <label className="text-sm font-bold text-indigo-400 flex items-center">
                                <Lock className="w-4 h-4 mr-1" />
                                Master Password (Local Vault)
                            </label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                placeholder="Used to encrypt/decrypt on client"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-glow group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Decrypting & Signing In...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/register" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
