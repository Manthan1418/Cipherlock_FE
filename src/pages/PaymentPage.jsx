import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getPlans, requestSubscription } from '../api/subscription';
import { Shield, CheckCircle, CreditCard, ArrowLeft, Loader } from 'lucide-react';

export default function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planId = searchParams.get('plan');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchPlan() {
            try {
                const plans = await getPlans();
                const found = plans.find((p, i) => {
                    const ids = ['free', 'basic', 'pro', 'enterprise'];
                    return ids[i] === planId;
                });
                setPlan(found);
            } catch (err) {
                toast.error('Failed to load plan details');
            } finally {
                setLoading(false);
            }
        }
        if (planId) fetchPlan();
        else setLoading(false);
    }, [planId]);

    const handlePay = async () => {
        setProcessing(true);
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            await requestSubscription(planId);
            setSuccess(true);
            toast.success('Request submitted!');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!planId || !plan) {
        return (
            <div className="text-center py-16 fade-in">
                <Shield className="w-16 h-16 mx-auto mb-4 text-indigo-500/50" />
                <h2 className="text-xl font-bold mb-2">No plan selected</h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Please select a plan from the subscription page.</p>
                <button onClick={() => navigate('/subscription')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all hover:scale-105">
                    View Plans
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-lg mx-auto mt-12 fade-in">
                <div className="glass rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Your request for the <strong className="text-white">{plan.name}</strong> plan has been received.
                        An administrator will grant you access shortly. You will be notified once your subscription is active.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate('/subscription')}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all hover:scale-105"
                        >
                            Go to Subscriptions
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 border rounded-lg transition-all hover:scale-105"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                        >
                            Back to Vault
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto mt-12 fade-in">
            <button onClick={() => navigate('/subscription')} className="flex items-center gap-2 text-sm mb-6 transition-all hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
                <ArrowLeft className="w-4 h-4" /> Back to Plans
            </button>

            <div className="glass rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-indigo-500" />
                    <div>
                        <h2 className="text-xl font-bold">{plan.name} Plan</h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.price_label}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-6 mb-6" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                        <span className="font-medium">₹{plan.price.toLocaleString('en-IN')}</span>
                    </div>
                    {plan.price > 0 && (
                        <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Billed monthly</p>
                    )}
                </div>

                <button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg font-medium transition-all hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                        <><CreditCard className="w-5 h-5" /> Pay ₹{plan.price.toLocaleString('en-IN')}</>
                    )}
                </button>

                {plan.price > 0 && (
                    <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                        Your card will not be charged. This is a demo — an admin will grant access after your request.
                    </p>
                )}
            </div>
        </div>
    );
}
