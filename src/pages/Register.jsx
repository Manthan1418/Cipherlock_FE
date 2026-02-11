import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Particles() {
    return (
        <div className="particles">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="particle" />
            ))}
        </div>
    );
}

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, masterPassword);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create an account.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center animated-bg px-4 py-8 relative overflow-hidden">
            <Particles />
            <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl glow scale-in relative z-10">
                <div className="text-center">
                    <div className="relative inline-block">
                        <Shield className="mx-auto h-14 w-14 text-indigo-500 shield-bounce" />
                        <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl -z-10"></div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold gradient-text">Create a PassMan Account</h2>
                    <p className="mt-2 text-sm text-gray-400">Start securing your passwords today</p>
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
                        <div className="fade-in" style={{ animationDelay: '0.15s' }}>
                            <label className="text-sm font-medium text-gray-300">Account Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-700/50 fade-in" style={{ animationDelay: '0.25s' }}>
                            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 rounded-xl mb-3 border border-amber-700/30 backdrop-blur-sm">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-200">
                                        <strong className="block text-amber-400 mb-1">IMPORTANT:</strong>
                                        This Master Password is used to encrypt your vault.
                                        We <strong>CANNOT</strong> recover it if you lose it.
                                    </p>
                                </div>
                            </div>
                            <label className="text-sm font-bold text-indigo-400 flex items-center">
                                <Lock className="w-4 h-4 mr-1" />
                                Master Password
                            </label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-indigo-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-animated transition-all"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
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
                                Generating Keys...
                            </span>
                        ) : 'Register'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
