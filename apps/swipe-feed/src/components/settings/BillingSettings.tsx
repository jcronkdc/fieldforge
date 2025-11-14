import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionInfo {
  status: string;
  plan: string;
  trial: boolean;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
}

export const BillingSettings: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments/subscription-status?customerId=${user?.stripeCustomerId || ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user?.stripeCustomerId) {
      alert('No billing information found. Please subscribe to a plan first.');
      return;
    }

    setPortalLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customerId: user.stripeCustomerId
        })
      });

      const { portalUrl, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'starter':
        return { name: 'Starter', price: '$49/month', color: 'text-blue-400' };
      case 'professional':
        return { name: 'Professional', price: '$149/month', color: 'text-purple-400' };
      case 'enterprise':
        return { name: 'Enterprise', price: '$499/month', color: 'text-blue-400' };
      default:
        return { name: 'Free', price: '$0/month', color: 'text-gray-400' };
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const planDetails = getPlanDetails(subscription?.plan || 'free');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-400">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Current Plan</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold ${planDetails.color}`}>
                {planDetails.name}
              </span>
              <span className="text-gray-400">{planDetails.price}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {subscription?.status === 'active' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Active</span>
              </>
            ) : subscription?.status === 'trialing' ? (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400">Trial Period</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Inactive</span>
              </>
            )}
          </div>
        </div>

        {subscription?.trial && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              You're currently in your 14-day free trial. Add a payment method to continue after your trial ends.
            </p>
          </div>
        )}

        {subscription?.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.cancelAtPeriodEnd 
                ? `Subscription ends on ${formatDate(subscription.currentPeriodEnd)}`
                : `Next billing date: ${formatDate(subscription.currentPeriodEnd)}`
              }
            </span>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Your subscription has been canceled and will end on {formatDate(subscription.currentPeriodEnd!)}.
              You'll still have access until then.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <CreditCard className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Billing Portal</h3>
          <p className="text-gray-400 mb-4 text-sm">
            Update payment methods, download invoices, and manage your subscription
          </p>
          <button
            onClick={openCustomerPortal}
            disabled={portalLoading}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {portalLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Open Billing Portal
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
          <Calendar className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Usage & Limits</h3>
          <p className="text-gray-400 mb-4 text-sm">
            View your current usage and plan limits
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Team Members</span>
                <span className="text-white">3 / {subscription?.plan === 'enterprise' ? '∞' : subscription?.plan === 'professional' ? '20' : '5'}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Storage Used</span>
                <span className="text-white">2.3 GB / {subscription?.plan === 'enterprise' ? '∞' : subscription?.plan === 'professional' ? '50 GB' : '5 GB'}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '46%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      {subscription?.plan === 'free' && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">Upgrade Your Plan</h3>
          <p className="text-gray-300 mb-4">
            Unlock advanced features and increase your limits by upgrading to a paid plan.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all"
          >
            View Plans
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Support */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Support</h3>
        <p className="text-gray-400 mb-4">
          Need help with billing or have questions about your subscription?
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:billing@fieldforge.com"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            billing@fieldforge.com
          </a>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <a
            href="https://docs.fieldforge.com/billing"
            className="text-blue-400 hover:text-blue-300 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Billing Documentation
          </a>
        </div>
      </div>
    </div>
  );
};
