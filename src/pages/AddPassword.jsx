import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { encryptData } from '../crypto/vaultCrypto';
import api from '../api/axios';
import { Lock, Save, RefreshCw, ChevronDown, ChevronUp, Shield, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddPassword() {
    const [site, setSite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Generator State
    const [showGenerator, setShowGenerator] = useState(false);
    const [genLength, setGenLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

    const { dbKey } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!dbKey) {
            toast.error('Vault is locked. Only available for this session.');
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

            toast.success('Password saved successfully!');
            navigate('/');
        } catch (err) {
            console.error("Full Backend Error:", err.response?.data || err.message);
            const detail = err.response?.data?.details || err.response?.data?.error || err.message;
            toast.error(`Failed to save password: ${detail}`);
        }
        setLoading(false);
    }

    function generatePassword() {
        let charset = "";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        if (includeUppercase) charset += uppercase;
        if (includeLowercase) charset += lowercase;
        if (includeNumbers) charset += numbers;
        if (includeSymbols) charset += symbols;

        if (charset === "") {
            toast.error("Please select at least one character type");
            return;
        }

        let newPassword = "";
        const array = new Uint32Array(genLength);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < genLength; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        setPassword(newPassword);
        toast.success("Password Generated!");
    }

    if (!dbKey) {
        return (
            <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl p-8 glow fade-in max-w-md mx-auto">
                <Shield className="w-16 h-16 text-red-500 mb-4 pulse-icon" />
                <h3 className="text-xl font-bold text-red-400 mb-2">Vault Locked</h3>
                <p className="text-gray-400 text-center">Please logout and login again with your Master Password.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gradient-text">
                <Lock className="mr-2 text-indigo-500" /> Add New Credentials
            </h1>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl glow space-y-6">
                <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Site / Service</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all placeholder-gray-500"
                        placeholder="e.g. Netflix"
                        value={site}
                        onChange={(e) => setSite(e.target.value)}
                    />
                </div>

                <div className="fade-in" style={{ animationDelay: '0.15s' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all placeholder-gray-500"
                        placeholder="email@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Password Generator Section */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-5 rounded-xl border border-gray-700/50 fade-in" style={{ animationDelay: '0.25s' }}>
                    <button
                        type="button"
                        onClick={() => setShowGenerator(!showGenerator)}
                        className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {showGenerator ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                        {showGenerator ? "Hide Password Generator" : "Show Password Generator"}
                    </button>

                    {showGenerator && (
                        <div className="mt-5 space-y-5 scale-in">
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span>Length: <strong className="text-indigo-400">{genLength}</strong></span>
                                    <span>64</span>
                                </label>
                                <input
                                    type="range"
                                    min="8"
                                    max="64"
                                    value={genLength}
                                    onChange={(e) => setGenLength(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center space-x-3 cursor-pointer glass p-3 rounded-xl hover:bg-gray-700/50 transition-all card-hover">
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300 font-medium">A-Z</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer glass p-3 rounded-xl hover:bg-gray-700/50 transition-all card-hover">
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300 font-medium">a-z</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer glass p-3 rounded-xl hover:bg-gray-700/50 transition-all card-hover">
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300 font-medium">0-9</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer glass p-3 rounded-xl hover:bg-gray-700/50 transition-all card-hover">
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300 font-medium">!@#</span>
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={generatePassword}
                                className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all btn-glow"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate & Fill
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all btn-glow disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Encrypting & Saving...
                            </span>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Encrypt & Save
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
