import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getPlans, getMySubscription, requestSubscription } from '../api/subscription';
import { Shield, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [limit, setLimit] = useState(null);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [plansData, subData] = await Promise.all([
                getPlans(),
                getMySubscription(),
            ]);
            setPlans(plansData);
            setSubscription(subData.subscription);
            setLimit(subData.limit);
            setDaysRemaining(subData.daysRemaining || 0);
        } catch (err) {
            toast.error('Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubscribe = async (planId) => {
        navigate(`/payment?plan=${planId}`);
    };

    const isCurrentPlan = (planId) => {
        if (!subscription) return planId === 'free';
        if (subscription.status !== 'active') return planId === 'free';
        return subscription.planId === planId;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Subscription</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your plan and usage</p>
            </div>

            {subscription && subscription.status === 'active' && (
                <div className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Plan</p>
                            <p className="text-xl font-bold">{plans.find(p => p.name.toLowerCase() === subscription.planId)?.name || subscription.planId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Days Remaining</p>
                            <p className={`text-xl font-bold ${daysRemaining <= 7 ? 'text-red-400' : daysRemaining <= 14 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {daysRemaining} days
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password Usage</p>
                            <p className="text-xl font-bold">
                                {limit?.current || 0}{limit?.max ? ` / ${limit.max}` : ''}
                            </p>
                        </div>
                    </div>
                    {limit && !limit.allowed && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                            <AlertTriangle className="w-4 h-4" />
                            Password limit reached. Upgrade your plan to add more.
                        </div>
                    )}
                    {daysRemaining <= 7 && daysRemaining > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                            <Clock className="w-4 h-4" />
                            Your plan expires in {daysRemaining} days. Renew to keep access.
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan, idx) => {
                    const isActive = isCurrentPlan(plan.name.toLowerCase());
                    const isFree = plan.name.toLowerCase() === 'free';
                    return (
                        <div
                            key={idx}
                            className={`glass rounded-xl p-6 card-hover relative ${isActive ? 'ring-2 ring-indigo-500' : ''}`}
                        >
                            {isActive && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium">
                                    Current
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-lg font-bold">{plan.name}</h3>
                            </div>
                            <p className="text-3xl font-bold mb-4">{plan.price_label}</p>
                            <div className="space-y-2 mb-6">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                            {!isFree && !isActive && (
                                <button
                                    onClick={() => handleSubscribe(plan.name.toLowerCase())}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Subscribe <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                            {isActive && !isFree && (
                                <button
                                    onClick={() => handleSubscribe(plan.name.toLowerCase())}
                                    className="w-full py-2.5 bg-indigo-600/50 text-white rounded-lg text-sm font-medium cursor-default"
                                    disabled
                                >
                                    Current Plan
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
