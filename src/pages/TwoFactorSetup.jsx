import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Loader2, Copy, Sparkles } from 'lucide-react';

export default function TwoFactorSetup() {
    const [loading, setLoading] = useState(true);
    const [secretData, setSecretData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    async function checkStatus() {
        try {
            const res = await api.get('/auth/2fa/status');
            setIsEnabled(res.data.enabled);
            if (!res.data.enabled) {
                generateSecret();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch 2FA status');
            setLoading(false);
        }
    }

    async function generateSecret() {
        try {
            setLoading(true);
            const res = await api.post('/auth/2fa/generate');
            setSecretData(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate 2FA secret');
            setLoading(false);
        }
    }

    async function handleVerify() {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        try {
            setVerifying(true);
            await api.post('/auth/2fa/enable', {
                secret: secretData.secret,
                code: verificationCode
            });
            setIsEnabled(true);
            toast.success('Two-factor authentication enabled!');
        } catch (err) {
            console.error(err);
            toast.error('Invalid code. Please try again.');
        } finally {
            setVerifying(false);
        }
    }

    async function handleDisable() {
        if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) return;

        try {
            setLoading(true);
            await api.post('/auth/2fa/disable');
            setIsEnabled(false);
            setSecretData(null);
            generateSecret(); // Generate new secret for next time
            toast.success('Two-factor authentication disabled');
        } catch (err) {
            console.error(err);
            toast.error('Failed to disable 2FA');
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <div className="relative">
                    <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"></div>
                </div>
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading 2FA settings...</p>
            </div>
        );
    }


    return (
        <div className="max-w-2xl mx-auto px-4 fade-in">
            <div className="glass p-8 rounded-2xl glow">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="relative">
                        <ShieldCheck className="h-10 w-10 text-indigo-500 pulse-icon" />
                        <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-lg -z-10"></div>
                    </div>
                    <h2 className="text-2xl font-bold gradient-text">Two-Factor Authentication</h2>
                </div>

                {isEnabled ? (
                    <div
                        className="rounded-2xl p-8 text-center scale-in"
                        style={{
                            backgroundColor: 'var(--success-bg)',
                            border: '1px solid var(--success-border)'
                        }}
                    >
                        <div className="flex justify-center mb-4">
                            <div
                                className="h-20 w-20 rounded-full flex items-center justify-center relative"
                                style={{ backgroundColor: 'var(--success-bg)' }}
                            >
                                <ShieldCheck className="h-10 w-10" style={{ color: 'var(--success-text)' }} />
                                <Sparkles className="absolute top-0 right-0 w-6 h-6 animate-pulse" style={{ color: 'var(--success-text)' }} />
                                <div className="absolute inset-0 rounded-full blur-xl" style={{ backgroundColor: 'var(--success-bg)' }}></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--success-text)' }}>2FA is Enabled</h3>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Your account is secured with two-factor authentication.</p>

                        <button
                            onClick={handleDisable}
                            className="px-6 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all btn-glow hover:shadow-red-500/20"
                        >
                            Disable 2FA
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Protect your account by enabling 2FA. You will be required to enter a code from your authenticator app (like Google Authenticator) when you log in.
                        </p>


                        {secretData && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl flex items-center justify-center card-hover">
                                    <QRCodeSVG value={secretData.uri} size={200} />
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Manual Entry Secret</label>
                                        <div className="flex items-center space-x-2">
                                            <code
                                                className="px-4 py-3 rounded-xl font-mono text-sm flex-1 break-all"
                                                style={{
                                                    backgroundColor: 'var(--bg-input)',
                                                    color: 'var(--accent-primary)',
                                                    border: '1px solid var(--border-input)'
                                                }}
                                            >
                                                {secretData.secret}
                                            </code>

                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(secretData.secret);
                                                    toast.success('Copied to clipboard');
                                                }}
                                                className="p-3 hover:bg-indigo-500/20 rounded-xl text-gray-400 hover:text-indigo-400 transition-all flex-shrink-0"
                                            >
                                                <Copy className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="123456"
                                            className="block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-center tracking-[0.3em] text-xl input-animated transition-all"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-input)'
                                            }}
                                        />
                                    </div>


                                    <button
                                        onClick={handleVerify}
                                        disabled={verifying || verificationCode.length !== 6}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all btn-glow flex items-center justify-center"
                                    >
                                        {verifying ? (
                                            <Loader2 className="animate-spin h-5 w-5" />
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-5 h-5 mr-2" />
                                                Verify & Enable
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
