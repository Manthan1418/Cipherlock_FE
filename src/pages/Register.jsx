import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-indigo-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Create a PassMan Account</h2>
                </div>
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
                            <label className="text-sm font-medium text-gray-300">Account Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                            <div className="bg-blue-900/20 p-3 rounded mb-2 border border-blue-800">
                                <p className="text-xs text-blue-200">
                                    <strong className="block text-blue-400 mb-1">IMPORTANT:</strong>
                                    This Master Password is used to encrypt your vault.
                                    We <strong>CANNOT</strong> recover it if you lose it.
                                </p>
                            </div>
                            <label className="text-sm font-bold text-indigo-400">Master Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Generating Keys...' : 'Register'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
