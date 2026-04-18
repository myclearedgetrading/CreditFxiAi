import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PLAN_PRICES } from '../constants/plans';

interface TierUpgradePromptProps {
  title: string;
  description: string;
  /** CTA for DIY Pro (default). Set `secondaryLabel` for Agency upsell. */
  primaryCta?: string;
}

const TierUpgradePrompt: React.FC<TierUpgradePromptProps> = ({
  title,
  description,
  primaryCta = `Upgrade to DIY Pro — $${PLAN_PRICES.DIY_PRO_MONTHLY_USD}/mo`,
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 to-[#0A0A0A] text-center space-y-4">
      <div className="inline-flex p-3 rounded-full bg-orange-500/20 text-orange-400">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm"
        >
          {primaryCta}
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-900"
        >
          Back to overview
        </button>
      </div>
      <p className="text-[11px] text-slate-600">
        Agency plan (${PLAN_PRICES.AGENCY_MONTHLY_USD}/mo) adds multi-client CRM — configure in Settings after checkout.
      </p>
    </div>
  );
};

export default TierUpgradePrompt;
