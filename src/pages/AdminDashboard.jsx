import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAdminUsers, grantUserAccess, revokeUserAccess, getPendingRequests, approveRequest } from '../api/admin';
import { getAdminToken, clearAdminToken } from '../api/adminSession';
import { Shield, Users, CheckCircle, XCircle, Clock, CreditCard, RefreshCw, LogOut } from 'lucide-react';

const PLANS = [
    { id: 'free', name: 'Free', maxPasswords: 5 },
    { id: 'basic', name: 'Basic', maxPasswords: 50 },
    { id: 'pro', name: 'Pro', maxPasswords: 200 },
    { id: 'enterprise', name: 'Enterprise', maxPasswords: 'Unlimited' },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('users');
    const [authorized, setAuthorized] = useState(true);
    const mounted = useRef(true);

    useEffect(() => {
        if (!getAdminToken()) {
            setAuthorized(false);
        }
    }, []);

    useEffect(() => {
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (!authorized) return;
        let cancelled = false;

        async function fetchData() {
            setLoading(true);
            try {
                const [usersData, requestsData] = await Promise.all([
                    getAdminUsers(),
                    getPendingRequests(),
                ]);
                if (!cancelled) {
                    setUsers(usersData);
                    setRequests(requestsData);
                }
            } catch (err) {
                if (cancelled) return;
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    clearAdminToken();
                    setAuthorized(false);
                    toast.error('Session expired. Please login again.');
                } else {
                    toast.error('Failed to load admin data');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [authorized]);

    async function handleGrant(uid, planId) {
        try {
            await grantUserAccess(uid, planId);
            toast.success('Access granted successfully');
            const [usersData, requestsData] = await Promise.all([
                getAdminUsers(),
                getPendingRequests(),
            ]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to grant access');
        }
    }

    async function handleRevoke(uid) {
        if (!window.confirm('Revoke access for this user?')) return;
        try {
            await revokeUserAccess(uid);
            toast.success('Access revoked');
            const [usersData, requestsData] = await Promise.all([
                getAdminUsers(),
                getPendingRequests(),
            ]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to revoke access');
        }
    }

    async function handleApprove(requestId, planId) {
        try {
            await approveRequest(requestId, planId);
            toast.success('Request approved');
            const [usersData, requestsData] = await Promise.all([
                getAdminUsers(),
                getPendingRequests(),
            ]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to approve request');
        }
    }

    function handleLogout() {
        clearAdminToken();
        navigate('/');
    }

    function getStatusBadge(status) {
        switch (status) {
            case 'active': return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3 h-3" />Active</span>;
            case 'cancelled': return <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" />Cancelled</span>;
            case 'expired': return <span className="flex items-center gap-1 text-xs text-yellow-400"><Clock className="w-3 h-3" />Expired</span>;
            default: return <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />None</span>;
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        try {
            const [usersData, requestsData] = await Promise.all([
                getAdminUsers(),
                getPendingRequests(),
            ]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                clearAdminToken();
                setAuthorized(false);
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Failed to refresh');
            }
        } finally {
            setRefreshing(false);
        }
    }

    if (!authorized) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-4">
                <div className="glass rounded-xl p-8 w-full max-w-sm text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-indigo-500/50" />
                    <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Please login with admin credentials first.
                    </p>
                    <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all hover:scale-105">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg font-sans" style={{ color: 'var(--text-primary)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage users and subscriptions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg transition-all duration-300 hover:scale-110" style={{ color: refreshing ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={handleLogout} className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:text-red-400" style={{ color: 'var(--text-secondary)' }} title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : ''}`} style={{ color: activeTab !== 'users' ? 'var(--text-secondary)' : '', backgroundColor: activeTab !== 'users' ? 'var(--bg-secondary)' : '' }}>
                        <Users className="w-4 h-4 inline mr-1" />Users ({users.length})
                    </button>
                    <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white' : ''}`} style={{ color: activeTab !== 'requests' ? 'var(--text-secondary)' : '', backgroundColor: activeTab !== 'requests' ? 'var(--bg-secondary)' : '' }}>
                        <CreditCard className="w-4 h-4 inline mr-1" />Requests ({requests.length})
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="space-y-3">
                        {users.length === 0 ? (
                            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No users found</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.uid} className="glass rounded-xl p-5 card-hover">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{user.email}</span>
                                                {user.role === 'admin' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Admin</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span>Passwords: {user.passwordCount}</span>
                                                <span>Plan: {user.subscription?.planId || 'Free'}</span>
                                                {getStatusBadge(user.subscription?.status)}
                                                {user.daysRemaining > 0 && (
                                                    <span className="text-yellow-400">{user.daysRemaining} days left</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {user.role !== 'admin' && (
                                                <>
                                                    <select
                                                        defaultValue={user.subscription?.planId || 'free'}
                                                        className="text-sm rounded-lg px-3 py-2 border"
                                                        style={{
                                                            backgroundColor: 'var(--bg-input)',
                                                            borderColor: 'var(--border-input)',
                                                            color: 'var(--text-primary)',
                                                        }}
                                                        onChange={(e) => {
                                                            const planId = e.target.value;
                                                            if (planId !== (user.subscription?.planId || 'free')) {
                                                                handleGrant(user.uid, planId);
                                                            }
                                                        }}
                                                    >
                                                        {PLANS.map((p) => (
                                                            <option key={p.id} value={p.id}>{p.name} ({p.maxPasswords})</option>
                                                        ))}
                                                    </select>
                                                    {user.subscription?.status === 'active' && (
                                                        <button onClick={() => handleRevoke(user.uid)} className="p-2 rounded-lg transition-all hover:scale-110 hover:text-red-400" style={{ color: 'var(--text-secondary)' }} title="Revoke access">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-3">
                        {requests.length === 0 ? (
                            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No pending requests</p>
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="glass rounded-xl p-5 card-hover">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <span className="font-medium">{req.email || req.uid}</span>
                                            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span>Plan: {req.planName || req.planId}</span>
                                                <span>{new Date(req.requestedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApprove(req.id, req.planId)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
                                        >
                                            <CheckCircle className="w-4 h-4 inline mr-1" />Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
