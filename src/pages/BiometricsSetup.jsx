import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import webauthnApi from '../api/webauthn';
import { useAuth } from '../context/AuthContext';

// Animation configuration
const ANIMATION_CONFIG = {
    spring: { stiffness: 200, damping: 28, mass: 0.8 },
    duration: { primary: 0.5, fade: 0.2 },
    easing: [0.4, 0, 0.2, 1],
};

function AnimatedButton({ children, loading, disabled, type = 'button', onClick, variant = 'primary' }) {
    const isPrimary = variant === 'primary';
    const bgClass = isPrimary 
        ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100';

    return (
        <motion.button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200 ${bgClass}`}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            transition={{ type: 'spring', ...ANIMATION_CONFIG.spring }}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                    >
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </motion.span>
                ) : (
                    <motion.span
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                    >
                        {children}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export default function BiometricsSetup() {
    const [loading, setLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function checkSupport() {
            try {
                const { browserSupportsWebAuthn } = await import('@simplewebauthn/browser');
                setIsSupported(browserSupportsWebAuthn());
            } catch (err) {
                console.error("Failed to load WebAuthn module:", err);
                setIsSupported(false);
            }
        }
        checkSupport();
    }, []);

    const handleRegister = async () => {
        try {
            setLoading(true);
            const success = await webauthnApi.registerBiometrics();
            if (success) {
                toast.success('Device registered successfully! You can now use Face ID or Touch ID to log in.');
                navigate('/');
            }
        } catch (err) {
            console.error('Registration failed:', err);
            const name = err?.name || '';
            const msg = err?.message || '';

            if (name === 'NotAllowedError') {
                toast.error('Registration was cancelled.');
            } else if (name === 'InvalidStateError') {
                toast.error('This device is already registered to your account.');
            } else {
                toast.error(msg || 'Failed to register device. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="glass rounded-3xl p-8 text-center space-y-6">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Not Supported</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Your current browser or device does not support native biometrics (WebAuthn).
                    </p>
                    <AnimatedButton onClick={() => navigate(-1)} variant="secondary">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </AnimatedButton>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_CONFIG.duration.primary, ease: ANIMATION_CONFIG.easing }}
            className="max-w-md mx-auto mt-12"
        >
            <div className="glass rounded-3xl p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                    <Fingerprint className="w-48 h-48 text-indigo-500 transform rotate-12" />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Shield className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                                Biometric Login <Sparkles className="w-5 h-5 text-yellow-400" />
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Register this device to use Face ID, Touch ID, or Windows Hello for faster, more secure logins.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 bg-gray-50 dark:bg-[#1a1c2e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                         <div className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-green-500/10 text-green-500 mt-1">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Hardware Encrypted</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your biometric data never leaves your device and is not sent to our servers.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 mt-4">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 mt-1">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Phishing Resistant</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Passkeys are tied directly to this website, making them immune to phishing attacks.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <AnimatedButton
                            onClick={handleRegister}
                            loading={loading}
                        >
                            <Fingerprint className="w-5 h-5 mr-2" />
                            Register Device
                        </AnimatedButton>
                        <AnimatedButton
                            onClick={() => navigate('/')}
                            variant="secondary"
                            disabled={loading}
                        >
                            Cancel
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
