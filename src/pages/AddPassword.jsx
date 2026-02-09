import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { encryptData } from '../crypto/vaultCrypto';
import api from '../api/axios';
import { Lock, Save } from 'lucide-react';

export default function AddPassword() {
    const [site, setSite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { dbKey } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!dbKey) {
            setError('Vault is locked. Only available for this session.');
            return;
        }

        try {
            setLoading(true);

            // 1. Encrypt locally
            const { ciphertext, iv } = await encryptData(dbKey, password);

            // 2. Send to backend
            await api.post('/vault', {
                site,
                username,
                encryptedPassword: ciphertext,
                iv: iv
            });

            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to save password.');
        }
        setLoading(false);
    }

    if (!dbKey) {
        return (
            <div className="text-center mt-10">
                <h3 className="text-xl text-red-500">Vault Locked</h3>
                <p className="text-gray-400">Please logout and login again with your Master Password.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <Lock className="mr-2" /> Add New Credentials
            </h1>

            {error && <div className="bg-red-500/10 text-red-500 p-3 mb-4 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site / Service</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Netflix"
                        value={site}
                        onChange={(e) => setSite(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="email@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <input
                        type="text" // Show as text so user can see what they are adding (common in PW managers)
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Encrypting & Saving...' : 'Encrypt & Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center mt-3 text-sm text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
