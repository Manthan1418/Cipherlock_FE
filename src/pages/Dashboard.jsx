import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { decryptData } from '../crypto/vaultCrypto';
import { Plus, Loader2, Shield, Key, Search } from 'lucide-react';
import PasswordCard from '../components/PasswordCard';
import { toast } from 'react-hot-toast';
import { getCategoryStyle } from '../pages/AddPassword';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';


export default function Dashboard() {
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { dbKey, legacyKeys } = useAuth();
    const [decryptedCache, setDecryptedCache] = useState({});
    const [visiblePasswords, setVisiblePasswords] = useState({});




    useEffect(() => {
        fetchVault();
        // Preload zxcvbn to avoid delay when rendering the chart
        void import('zxcvbn');
    }, []);

    useEffect(() => {
        if (dbKey && passwords.length > 0) {
            decryptAll(passwords);
        }
    }, [dbKey, passwords]);

    const [strengthStats, setStrengthStats] = useState({ data: [], weakItems: [] });

    useEffect(() => {
        let isMounted = true;
        const calculateStrength = async () => {
            if (passwords.length === 0) return;

            // Removed artificial delay to show chart faster
            // await new Promise(r => setTimeout(r, 100));

            try {
                const zxcvbnModule = await import('zxcvbn');
                const zxcvbn = zxcvbnModule.default;

                const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
                const weakItems = [];

                // Process in chunks if needed, but for now just all at once async
                passwords.forEach(item => {
                    const pwd = decryptedCache[item.id];
                    if (pwd && !pwd.startsWith("ERROR")) {
                        const score = zxcvbn(pwd).score;
                        stats[score] = (stats[score] || 0) + 1;
                        if (score < 2) {
                            weakItems.push({ ...item, score });
                        }
                    }
                });

                if (isMounted) {
                    const data = [
                        { name: 'Weak', value: stats[0] + stats[1], color: '#ef4444' },
                        { name: 'Fair', value: stats[2], color: '#f59e0b' },
                        { name: 'Good', value: stats[3], color: '#3b82f6' },
                        { name: 'Strong', value: stats[4], color: '#10b981' },
                    ].filter(d => d.value > 0);

                    setStrengthStats({ data, weakItems });
                }
            } catch (error) {
                console.error("Failed to load zxcvbn or calculate strength", error);
            }
        };

        calculateStrength();

        return () => { isMounted = false; };
    }, [passwords, decryptedCache]);

    async function fetchVault() {
        try {
            const res = await api.get('/vault');
            setPasswords(res.data);
        } catch (error) {
            console.error("Failed to fetch vault", error.response?.data || error.message);
            toast.error("Couldn't load your vault. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    async function decryptAll(items) {
        if (!dbKey) return;

        const candidateKeys = [dbKey, ...(legacyKeys || [])];

        // Parallelize decryption for speed
        const results = await Promise.all(items.map(async (item) => {
            try {
                for (const key of candidateKeys) {
                    try {
                        const plaintext = await decryptData(key, item.encryptedPassword, item.iv);
                        return { id: item.id, plaintext };
                    } catch {
                        // Try next candidate key.
                    }
                }
                throw new Error('No matching key could decrypt this item.');
            } catch (e) {
                console.error(`Failed to decrypt item ${item.id}`, e);
                return { id: item.id, plaintext: "ERROR: Decryption Failed" };
            }
        }));

        const newCache = {};
        results.forEach(res => {
            newCache[res.id] = res.plaintext;
        });

        setDecryptedCache(newCache);
    }

    async function handleDelete(id) {
        const item = passwords.find(p => p.id === id);
        const siteName = item?.site ? `"${item.site}"` : 'this password';
        toast(
            (t) => (
                <span style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span>Delete {siteName}? This cannot be undone.</span>
                    <span style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            style={{ padding: '4px 12px', borderRadius: '8px', background: 'transparent', border: '1px solid currentColor', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await api.delete(`/vault/${id}`);
                                    setPasswords(prev => prev.filter(p => p.id !== id));
                                    toast.success(`${item?.site || 'Password'} deleted.`);
                                } catch (error) {
                                    console.error("Failed to delete", error);
                                    toast.error("Couldn't delete this password. Please try again.");
                                }
                            }}
                            style={{ padding: '4px 12px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                            Delete
                        </button>
                    </span>
                </span>
            ),
            { duration: 8000 }
        );
    }

    async function copyToClipboard(text, label = 'Password') {
        if (!text) {
            toast.error(`${label} is empty.`);
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`);
        } catch {
            toast.error(`Failed to copy ${label.toLowerCase()}.`);
        }
    }

    function toggleVisibility(id) {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    // Derive categories present in vault for the filter bar
    const categories = useMemo(() => {
        const cats = [...new Set(passwords.map(p => p.category || 'General'))];
        return cats.sort();
    }, [passwords]);

    const categoryCounts = useMemo(() => {
        const counts = {};
        for (const p of passwords) {
            const category = p.category || 'General';
            counts[category] = (counts[category] || 0) + 1;
        }
        return counts;
    }, [passwords]);

    const filteredPasswords = useMemo(() => {
        let result = passwords;
        if (activeCategory !== 'All') {
            result = result.filter(p => (p.category || 'General') === activeCategory);
        }
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.site && String(p.site).toLowerCase().includes(query)) ||
                (p.username && String(p.username).toLowerCase().includes(query)) ||
                (p.category && String(p.category).toLowerCase().includes(query))
            );
        }
        return result;
    }, [passwords, activeCategory, searchQuery]);

    if (!dbKey) {
        return (
            <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl p-8 glow">
                <Shield className="w-16 h-16 text-red-500 mb-4 pulse-icon" />
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--error-text)' }}>Vault Locked</h2>
                <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Your session encryption key is missing. Please re-login.</p>
            </div>
        );
    }


    return (
        <div className="px-4 relative">
            <div className="flex justify-between items-center mb-8 fade-in relative z-50">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-1">Your Vault</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{passwords.length} secured credentials</p>
                </div>

                <div className="flex items-center space-x-4">

                    <Link
                        to="/add"
                        className="btn-glow flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl font-medium transition-all duration-300"
                    >
                        <Plus className="w-5 h-5 sm:mr-1 flex-shrink-0" />
                        <span className="hidden sm:inline">Add Password</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-16">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <div className="absolute inset-0 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>
                    </div>
                    <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Decrypting your vault...</p>
                </div>
            ) : passwords.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl glow fade-in">
                    <Key className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Your vault is empty.</p>
                    <Link to="/add" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center hover:underline transition-colors">
                        <Plus className="w-4 h-4 mr-1" />
                        Add your first password
                    </Link>
                </div>
            ) : (
                <>
                    {/* Search and Category Filter Section */}
                    <div className="mb-6 fade-in space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-full sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by site, username, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoCapitalize="none"
                                className="block w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                                data-testid="dashboard-search-input"
                            />
                        </div>

                        {/* Category Filter Tab Bar */}
                        {categories.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                {['All', ...categories].map(cat => {
                                    const isActive = activeCategory === cat;
                                    const style = cat === 'All' ? null : getCategoryStyle(cat);
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border"
                                            style={isActive
                                                ? {
                                                    backgroundColor: style ? style.bg : 'rgba(99,102,241,0.25)',
                                                    color: style ? style.text : '#818cf8',
                                                    borderColor: style ? style.text : '#818cf8',
                                                    boxShadow: `0 0 12px ${style ? style.bg : 'rgba(99,102,241,0.3)'}`
                                                }
                                                : {
                                                    backgroundColor: 'transparent',
                                                    color: 'var(--text-secondary)',
                                                    borderColor: 'var(--border-color)'
                                                }
                                            }
                                            data-testid={`category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                        >
                                            {cat} {cat !== 'All' && <span className="ml-1 opacity-60 text-xs">({categoryCounts[cat] || 0})</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col-reverse lg:flex-row gap-8 items-start fade-in">
                        {/* Cards Grid - Left Side */}
                        <div className="flex-1 w-full grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 stagger-children">
                            {filteredPasswords.length === 0 ? (
                                <div className="col-span-2 text-center py-12">
                                    <p style={{ color: 'var(--text-secondary)' }}>No passwords in <strong>{activeCategory}</strong>.</p>
                                    <Link to="/add" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">Add one</Link>
                                </div>
                            ) : filteredPasswords.map((item, index) => (
                                <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <PasswordCard
                                        item={item}
                                        isVisible={visiblePasswords[item.id]}
                                        decryptedPassword={decryptedCache[item.id]}
                                        onToggleVisibility={toggleVisibility}
                                        onCopy={copyToClipboard}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Security Health Chart - Right Side */}
                        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24 z-0 space-y-6">
                            {/* Chart Card */}
                            <div className="glass p-3 sm:p-6 rounded-2xl glow relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
                                <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 z-10" style={{ color: 'var(--text-primary)' }}>Security Score</h3>

                                <div className="flex flex-row lg:flex-col items-center gap-3 sm:gap-4">
                                    {/* Pie Chart - Left on mobile, top on desktop sidebar */}
                                    <div className="w-1/2 lg:w-full h-32 sm:h-48 relative z-10 flex-shrink-0 outline-none focus:outline-none active:outline-none">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={strengthStats.data}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="50%"
                                                    outerRadius="70%"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="white"
                                                >
                                                    {strengthStats.data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    cursor={false}
                                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    itemStyle={{ color: 'var(--text-primary)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center Text */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <span className="text-xl sm:text-3xl font-bold gradient-text">{passwords.length}</span>
                                                <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-60" style={{ color: 'var(--text-secondary)' }}>Items</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend - Right on mobile, bottom on desktop sidebar */}
                                    <div className="w-1/2 lg:w-full grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-3">
                                        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-[10px] sm:text-xs font-medium text-emerald-400">Strong</span>
                                            <span className="text-xs sm:text-sm font-bold text-emerald-300 ml-1">{strengthStats.data.find(d => d.name === 'Strong')?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <span className="text-[10px] sm:text-xs font-medium text-blue-400">Good</span>
                                            <span className="text-xs sm:text-sm font-bold text-blue-300 ml-1">{strengthStats.data.find(d => d.name === 'Good')?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <span className="text-[10px] sm:text-xs font-medium text-amber-400">Fair</span>
                                            <span className="text-xs sm:text-sm font-bold text-amber-300 ml-1">{strengthStats.data.find(d => d.name === 'Fair')?.value || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <span className="text-[10px] sm:text-xs font-medium text-red-400">Weak</span>
                                            <span className="text-xs sm:text-sm font-bold text-red-300 ml-1">{(strengthStats.data.find(d => d.name === 'Weak')?.value || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Add Action Card if space permits */}

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
