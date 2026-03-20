import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { encryptData, decryptData } from '../crypto/vaultCrypto';
import api from '../api/axios';
import { Lock, Save, RefreshCw, ChevronDown, ChevronUp, Shield, Sparkles, Tag, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PRESET_CATEGORIES = ['General', 'Work', 'Social', 'Banking', 'Gaming', 'Shopping', 'Email', 'Other'];

const CATEGORY_COLORS = {
    General: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    Work: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    Social: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
    Banking: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    Gaming: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
    Shopping: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    Email: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
    Other: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af' },
};

function getCategoryStyle(cat) {
    return CATEGORY_COLORS[cat] || { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' };
}

export { PRESET_CATEGORIES, getCategoryStyle };

export default function AddPassword() {
    const [site, setSite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);
    const [customCategories, setCustomCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [siteError, setSiteError] = useState('');

    // Generator State
    const [showGenerator, setShowGenerator] = useState(false);
    const [genLength, setGenLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

    const { dbKey, legacyKey, currentUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    // Load custom categories from localStorage on mount
    useEffect(() => {
        if (!currentUser) return;
        const stored = localStorage.getItem(`cipherlock_categories_${currentUser.uid}`);
        if (stored) {
            try { setCustomCategories(JSON.parse(stored)); } catch { }
        }
    }, [currentUser]);

    useEffect(() => {
        if (isEditing && dbKey) {
            fetchPasswordDetails();
        }
    }, [id, dbKey]);

    function saveCustomCategories(list) {
        if (!currentUser) return;
        setCustomCategories(list);
        localStorage.setItem(`cipherlock_categories_${currentUser.uid}`, JSON.stringify(list));
    }

    function handleAddCustomCategory() {
        const trimmed = newCategoryInput.trim();
        if (!trimmed) return;
        const allCats = [...PRESET_CATEGORIES, ...customCategories];
        if (allCats.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
            setCategory(trimmed);
        } else {
            const updated = [...customCategories, trimmed];
            saveCustomCategories(updated);
            setCategory(trimmed);
        }
        setNewCategoryInput('');
        setShowNewCategory(false);
    }

    async function fetchPasswordDetails() {
        try {
            setLoading(true);
            const res = await api.get(`/vault/${id}`);
            const item = res.data;
            setSite(item.site);
            setUsername(item.username);
            setCategory(item.category || 'General');
            try {
                let plaintext;
                try {
                    plaintext = await decryptData(dbKey, item.encryptedPassword, item.iv);
                } catch (primaryErr) {
                    if (legacyKey) {
                        try {
                            plaintext = await decryptData(legacyKey, item.encryptedPassword, item.iv);
                        } catch (legacyErr) {
                            throw primaryErr;
                        }
                    } else {
                        throw primaryErr;
                    }
                }
                setPassword(plaintext);
            } catch (decryptErr) {
                console.error("Decryption failed", decryptErr);
                toast.error("Couldn't decrypt this entry — your session key may have changed.");
            }
        } catch (error) {
            console.error("Failed to fetch password details", error);
            toast.error("Couldn't load that entry. It may have been deleted.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Custom validation for Site field (HTML5 required can't be seen by test runners)
        if (!site.trim()) {
            setSiteError('Site/App name required');
            return;
        }
        setSiteError('');

        if (!dbKey) {
            toast.error('Your vault is locked. Please sign out and log in again.');
            return;
        }

        try {
            setLoading(true);

            // 1. Encrypt locally
            const { ciphertext, iv } = await encryptData(dbKey, password);

            // 2. Send to backend
            const payload = {
                site,
                username,
                encryptedPassword: ciphertext,
                iv: iv,
                category: category || 'General',
            };

            if (isEditing) {
                await api.put(`/vault/${id}`, payload);
                toast.success('Credentials updated successfully!');
            } else {
                await api.post('/vault', payload);
                toast.success(`Saved ${site ? `"${site}"` : 'credentials'} to your vault!`);
            }

            navigate('/');
        } catch (err) {
            console.error("Full Backend Error:", err.response?.data || err.message);
            toast.error('Failed to save. Please try again or check your connection.');
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
            toast.error("Select at least one character type to generate a password.");
            return;
        }

        let newPassword = "";
        const array = new Uint32Array(genLength);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < genLength; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        setPassword(newPassword);
        toast.success('Strong password generated and filled!');
    }

    if (!dbKey) {
        return (
            <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl p-8 glow fade-in max-w-md mx-auto">
                <Shield className="w-16 h-16 text-red-500 mb-4 pulse-icon" />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--error-text)' }}>Vault Locked</h3>
                <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Please logout and login again with your Master Password.</p>
            </div>
        )
    }


    return (
        <div className="max-w-2xl mx-auto px-4 fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gradient-text">
                <Lock className="mr-2 text-indigo-500" /> {isEditing ? "Edit Credentials" : "Add New Credentials"}
            </h1>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl glow space-y-6">
                <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Site / Service</label>
                    <input
                        type="text"
                        required
                         className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: siteError ? '#ef4444' : 'var(--border-input)'
                        }}
                        placeholder="e.g. Netflix"
                        value={site}
                        onChange={(e) => { setSite(e.target.value); if (e.target.value.trim()) setSiteError(''); }}
                    />
                    {siteError && (
                        <p className="mt-1 text-sm text-red-400" role="alert">{siteError}</p>
                    )}
                </div>

                <div className="fade-in" style={{ animationDelay: '0.12s' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username / Email</label>
                    <input
                        type="text"
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-input)'
                        }}
                        placeholder="e.g. user@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>


                <div className="fade-in" style={{ animationDelay: '0.15s' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        <Tag className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />Category
                    </label>

                    {!showNewCategory ? (
                        <select
                            value={category}
                            onChange={(e) => {
                                if (e.target.value === '__new__') {
                                    setShowNewCategory(true);
                                } else {
                                    setCategory(e.target.value);
                                }
                            }}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-input)'
                            }}
                        >
                            {[...PRESET_CATEGORIES, ...customCategories].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="__new__">+ New category…</option>
                        </select>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); } if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryInput(''); } }}
                                placeholder="e.g. Finance, Travel..."
                                className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-input)' }}
                            />
                            <button type="button" onClick={handleAddCustomCategory}
                                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center gap-1 font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                            <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryInput(''); }}
                                className="px-3 py-3 rounded-xl transition-all border"
                                style={{ borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>


                <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                    <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none input-animated transition-all"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-input)'
                        }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>


                {/* Password Generator Section */}
                <div
                    className="p-5 rounded-xl fade-in"
                    style={{
                        animationDelay: '0.25s',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
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
                                <label
                                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all card-hover"
                                    style={{ backgroundColor: 'var(--bg-input)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>A-Z</span>
                                </label>
                                <label
                                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all card-hover"
                                    style={{ backgroundColor: 'var(--bg-input)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>a-z</span>
                                </label>
                                <label
                                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all card-hover"
                                    style={{ backgroundColor: 'var(--bg-input)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>0-9</span>
                                </label>
                                <label
                                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all card-hover"
                                    style={{ backgroundColor: 'var(--bg-input)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                                        className="form-checkbox text-indigo-500 rounded focus:ring-indigo-500"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>!@#</span>
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
                                {isEditing ? "Updating..." : "Encrypting & Saving..."}
                            </span>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEditing ? "Update Credentials" : "Encrypt & Save"}
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
