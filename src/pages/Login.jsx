import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { deriveKey } from '../crypto/vaultCrypto';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Firebase Auth Password
    const [masterPassword, setMasterPassword] = useState(''); // Local Vault Password
    const { login, setDbKey } = useAuth(); // setDbKey exposed for manual derivation if needed logic was separated
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            // This calls our context login which derives the key
            await login(email, password, masterPassword);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to log in. Check your credentials.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-indigo-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Sign in to PassMan</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Zero-Knowledge Encryption
                    </p>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Email address</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Account Password (Firebase)</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                            <label className="text-sm font-bold text-indigo-400">Master Password (Local Vault)</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                placeholder="Used to encrypt/decrypt on client"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Decrypting & Signing In...' : 'Sign In'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/register" className="text-sm text-indigo-400 hover:text-indigo-300">
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
