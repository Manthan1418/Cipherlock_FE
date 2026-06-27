import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Lock, Sparkles, Key, Fingerprint, ChevronRight, Star, ArrowDown } from 'lucide-react';
import { getPlans } from '../api/subscription';

function Particles() {
    return (
        <div className="particles">
            {[...Array(12)].map((_, i) => <div key={i} className="particle" />)}
        </div>
    );
}

const FEATURES = [
    { icon: Lock, title: 'AES-256 Encryption', desc: 'Your data is encrypted client-side before it ever reaches our servers. Zero-knowledge architecture.' },
    { icon: Key, title: 'Master Password', desc: 'A single master password with 600,000 PBKDF2 iterations. Only you hold the key.' },
    { icon: Fingerprint, title: 'Passkey & Biometrics', desc: 'Log in with fingerprint, Face ID, or Windows Hello via WebAuthn.' },
    { icon: Star, title: '2FA Support', desc: 'Time-based one-time passwords add an extra layer of security to your account.' },
];

export default function LandingPage() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        getPlans().then(setPlans).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen animated-bg font-sans relative overflow-hidden" style={{ color: 'var(--text-primary)' }}>
            <Particles />

            {/* Nav */}
            <nav className="glass border-b border-gray-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-indigo-500 shield-bounce" />
                            <span className="font-bold text-xl tracking-tight gradient-text">Cipherlock</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
                                Login
                            </Link>
                            <Link to="/register" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all hover:scale-105">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8" style={{ backgroundColor: 'var(--glow-color)', color: 'var(--accent-primary)', border: '1px solid' }}>
                    <Sparkles className="w-4 h-4" /> Your private vault, reimagined
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Secure Password<br />
                    <span className="gradient-text">Management</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
                    Cipherlock encrypts your vault entries client-side so only you can read them.
                    Zero-knowledge, open-core, and built for modern authentication.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link to="/register" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 flex items-center gap-2 text-lg">
                        Get Started Free <ChevronRight className="w-5 h-5" />
                    </Link>
                    <a href="#pricing" className="px-8 py-3.5 border rounded-xl font-semibold transition-all hover:scale-105 text-lg flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        View Plans <ArrowDown className="w-5 h-5" />
                    </a>
                    <Link to="/login" className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 text-lg" style={{ color: 'var(--text-secondary)' }}>
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">Why Cipherlock?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feat, i) => (
                        <div key={i} className="glass rounded-xl p-6 card-hover text-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--glow-color)' }}>
                                <feat.icon className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h3 className="font-bold mb-2">{feat.title}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 py-20 scroll-mt-20">
                <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
                <p className="text-center mb-12" style={{ color: 'var(--text-secondary)' }}>Start free, upgrade when you need more.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan, idx) => {
                        const isFree = plan.name.toLowerCase() === 'free';
                        return (
                            <div key={idx} className={`glass rounded-xl p-6 card-hover flex flex-col ${plan.name.toLowerCase() === 'pro' ? 'ring-2 ring-indigo-500' : ''}`}>
                                {plan.name.toLowerCase() === 'pro' && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium whitespace-nowrap">
                                        Most Popular
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                </div>
                                <p className="text-3xl font-bold mb-4">{plan.price_label}</p>
                                <div className="space-y-2 mb-6 flex-1">
                                    {plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                                {isFree ? (
                                    <Link to="/register" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 text-center block">
                                        Get Started
                                    </Link>
                                ) : (
                                    <Link to="/subscription" className="w-full py-2.5 border rounded-lg text-sm font-medium transition-all hover:scale-105 text-center block" style={{ borderColor: 'var(--border-color)' }}>
                                        Learn More
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t py-8 text-center text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold gradient-text">Cipherlock</span>
                </div>
                <p>Zero-knowledge password management. Your vault, your key.</p>
            </footer>
        </div>
    );
}
