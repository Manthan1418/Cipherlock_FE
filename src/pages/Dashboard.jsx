import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { decryptData } from '../crypto/vaultCrypto';
import { Plus, Trash2, Copy, Eye, EyeOff, Loader2, Shield, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
            toast.error("Failed to load vault items");
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
            toast.success("Password deleted");
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete password");
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    }

    function toggleVisibility(id) {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    if (!dbKey) {
        return (
            <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl p-8 glow">
                <Shield className="w-16 h-16 text-red-500 mb-4 pulse-icon" />
                <h2 className="text-xl font-bold text-red-400 mb-2">Vault Locked</h2>
                <p className="text-gray-400 text-center">Your session encryption key is missing. Please re-login.</p>
            </div>
        );
    }

    return (
        <div className="px-4">
            <div className="flex justify-between items-center mb-8 fade-in">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-1">Your Vault</h1>
                    <p className="text-gray-400 text-sm">{passwords.length} secured credentials</p>
                </div>
                <Link
                    to="/add"
                    className="btn-glow flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Password
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-16">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <div className="absolute inset-0 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>
                    </div>
                    <p className="text-gray-400 mt-4">Decrypting your vault...</p>
                </div>
            ) : passwords.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl glow fade-in">
                    <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Your vault is empty.</p>
                    <Link to="/add" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center hover:underline transition-colors">
                        <Plus className="w-4 h-4 mr-1" />
                        Add your first password
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                    {passwords.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="glass p-5 rounded-2xl card-hover glow-hover group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <span className="text-white font-bold text-lg">{item.site.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white truncate max-w-[140px]">{item.site}</h3>
                                        <p className="text-sm text-gray-400 truncate max-w-[180px]">{item.username}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => copyToClipboard(item.username)}
                                        className="p-2 hover:bg-indigo-500/20 rounded-lg text-gray-400 hover:text-indigo-400 transition-all"
                                        title="Copy Username"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-900/60 p-3 rounded-xl flex items-center justify-between border border-gray-700/30 backdrop-blur-sm">
                                <div className="font-mono text-sm text-gray-300 truncate mr-2">
                                    {visiblePasswords[item.id]
                                        ? (decryptedCache[item.id] || "Decrypting...")
                                        : "••••••••••••"}
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400">
                                    <button
                                        onClick={() => toggleVisibility(item.id)}
                                        className="p-1.5 hover:bg-gray-700/50 rounded-lg hover:text-white transition-all"
                                    >
                                        {visiblePasswords[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(decryptedCache[item.id])}
                                        className="p-1.5 hover:bg-gray-700/50 rounded-lg hover:text-white transition-all"
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
