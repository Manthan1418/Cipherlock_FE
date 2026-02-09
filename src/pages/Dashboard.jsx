import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { decryptData } from '../crypto/vaultCrypto';
import { Plus, Trash2, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { dbKey } = useAuth();
    const [decryptedCache, setDecryptedCache] = useState({}); // simple caching to avoid re-decrypting on every render
    const [visiblePasswords, setVisiblePasswords] = useState({}); // Toggle visibility per item

    useEffect(() => {
        fetchVault();
    }, []);

    async function fetchVault() {
        try {
            const res = await api.get('/vault');
            setPasswords(res.data);
            // Decrypt immediately or lazy load? 
            // Better to lazy load or decrypt all at once if list is small. 
            // Let's decrypt all valid ones now.
            decryptAll(res.data);
        } catch (error) {
            console.error("Failed to fetch vault", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }

    async function decryptAll(items) {
        if (!dbKey) return;

        const newCache = {};
        for (const item of items) {
            try {
                const plaintext = await decryptData(dbKey, item.encryptedPassword, item.iv);
                newCache[item.id] = plaintext;
            } catch (e) {
                console.error(`Failed to decrypt item ${item.id}`, e);
                newCache[item.id] = "ERROR: Decryption Failed";
            }
        }
        setDecryptedCache(prev => ({ ...prev, ...newCache }));
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this password?")) return;
        try {
            await api.delete(`/vault/${id}`);
            setPasswords(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    }

    function toggleVisibility(id) {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    if (!dbKey) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-xl font-bold text-red-500 mb-2">Vault Locked</h2>
                <p className="text-gray-400">Your session encryption key is missing. Please re-login.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Your Vault</h1>
                <Link
                    to="/add"
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Password
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            ) : passwords.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-lg">Your vault is empty.</p>
                    <Link to="/add" className="text-indigo-400 mt-2 inline-block hover:underline">Add your first password</Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {passwords.map(item => (
                        <div key={item.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white truncate max-w-[150px]">{item.site}</h3>
                                    <p className="text-sm text-gray-400 truncate max-w-[200px]">{item.username}</p>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => copyToClipboard(item.username)}
                                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                                        title="Copy Username"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-3 rounded-lg flex items-center justify-between border border-gray-700/50">
                                <div className="font-mono text-sm text-gray-300 truncate mr-2">
                                    {visiblePasswords[item.id]
                                        ? (decryptedCache[item.id] || "Decrypting...")
                                        : "••••••••••••"}
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                    <button
                                        onClick={() => toggleVisibility(item.id)}
                                        className="p-1 hover:text-white"
                                    >
                                        {visiblePasswords[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(decryptedCache[item.id])}
                                        className="p-1 hover:text-white"
                                        title="Copy Password"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
