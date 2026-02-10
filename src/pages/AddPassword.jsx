import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { encryptData } from '../crypto/vaultCrypto';
import api from '../api/axios';
import { Lock, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
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

                {/* Password Generator Section */}
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <button
                        type="button"
                        onClick={() => setShowGenerator(!showGenerator)}
                        className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none"
                    >
                        {showGenerator ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                        {showGenerator ? "Hide Password Generator" : "Show Password Generator"}
                    </button>

                    {showGenerator && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Length: {genLength}</span>
                                    <span>64</span>
                                </label>
                                <input
                                    type="range"
                                    min="8"
                                    max="64"
                                    value={genLength}
                                    onChange={(e) => setGenLength(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded border border-gray-600 hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300">A-Z</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded border border-gray-600 hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300">a-z</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded border border-gray-600 hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300">0-9</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded border border-gray-600 hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                                    />
                                    <span className="text-sm text-gray-300">!@#</span>
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={generatePassword}
                                className="w-full flex items-center justify-center py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-medium transition"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate & Fill
                            </button>
                        </div>
                    )}
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
