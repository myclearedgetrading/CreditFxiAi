import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { PLAN_PRICES } from '../constants/plans';

/**
 * Shown when the user is signed in but has no active DIY Pro or Agency subscription.
 */
const SubscriptionGate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="inline-flex p-4 rounded-2xl bg-orange-500/10 text-orange-400 mb-6">
        <CreditCard className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Subscription required</h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">
        CreditFix AI is pay-to-play. Choose <strong className="text-slate-200">DIY Pro</strong> (
        ${PLAN_PRICES.DIY_PRO_MONTHLY_USD}/mo) or <strong className="text-slate-200">Agency</strong> (
        ${PLAN_PRICES.AGENCY_MONTHLY_USD}/mo) in Settings to unlock disputes, AI credit analysis, education, and
        progress tracking.
      </p>
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-900/30"
      >
        View plans & subscribe
      </button>
    </div>
  );
};

export default SubscriptionGate;
