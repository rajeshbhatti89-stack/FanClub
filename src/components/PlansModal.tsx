import React, { useState } from 'react';
import type { PlanType } from '../types/cricket';
import { Check, Sparkles, Crown, Zap, Shield, X, QrCode, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  const [showUpiModal, setShowUpiModal] = useState<PlanType | null>(null);
  const [upiRefId, setUpiRefId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = (plan: PlanType) => {
    if (plan === 'free') {
      onSelectPlan('free');
      onClose();
      return;
    }
    setShowUpiModal(plan);
  };

  const handleActivate = () => {
    if (!showUpiModal) return;
    setIsVerifying(true);
    setTimeout(() => {
      onSelectPlan(showUpiModal);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsVerifying(false);
      setShowUpiModal(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> FanClub Membership Plans
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Choose Your FanClub Cricket Experience
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            Affordable scoring & broadcast suite designed for local tournaments, gully cricket stars & academy pros.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FREE PLAN */}
          <div className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all ${
            currentPlan === 'free' 
              ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-100 shadow-md' 
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-slate-100 text-slate-700">
                  Starter
                </span>
                {currentPlan === 'free' && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Active Plan
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">Free Tier</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                <span className="text-slate-500 text-sm ml-1">/ forever</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                Essential cricket scoring for friendly casual matches with your friends.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full Live Ball-by-ball scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard Batsmen & Bowlers scorecard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Match Best Batsman, Bowler & MVP display</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Scorecard Share</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Interactive Wagon Wheel pitch</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Full Tournament & Points Table Suite</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>OBS Studio Live Broadcast URL</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgradeClick('free')}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPlan === 'free'
                  ? 'bg-slate-200 text-slate-700 cursor-default'
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              {currentPlan === 'free' ? 'Currently Active' : 'Switch to Free Tier'}
            </button>
          </div>

          {/* PRO PLAN - ₹21 */}
          <div className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all relative ${
            currentPlan === 'pro'
              ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-100 shadow-md'
              : 'border-blue-200 bg-white hover:border-blue-400'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3" /> Most Popular
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-blue-100 text-blue-800">
                  Scorer Pro
                </span>
                {currentPlan === 'pro' && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Active Plan
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">Pro Plan</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-blue-600">₹21</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                Unlock tournament creators, wagon wheel, and Manhattan over charts.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Tournament Management</strong> (Create & Points Table)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Interactive Wagon Wheel</strong> (8 field zones & lofted shots)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Over-by-Over Manhattan</strong> and Worm charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Player career statistics and profiles</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Full Standalone OBS Live Stream Overlay</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgradeClick('pro')}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                currentPlan === 'pro'
                  ? 'bg-blue-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {currentPlan === 'pro' ? 'Currently Active' : 'Upgrade to Pro (₹21)'}
            </button>
          </div>

          {/* PREMIUM PLAN - ₹51 */}
          <div className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all relative ${
            currentPlan === 'premium'
              ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-100 shadow-md'
              : 'border-indigo-200 bg-white hover:border-indigo-400'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-200" /> Full Suite Access
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-indigo-100 text-indigo-800">
                  Broadcast Elite
                </span>
                {currentPlan === 'premium' && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Active Plan
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">Premium Plan</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-indigo-600">₹51</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                Complete access to broadcast overlays, custom team branding, and tournament suites.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Pro Plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Full Tournament Suite</strong> (Add Tournaments, Teams & NRR)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>OBS Studio Browser Source URL</strong> (Direct Streaming Overlay)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>World Cup Final & Asia Cup TV HUD Ribbons</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Dynamic Team Color & Logo Morphing</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All Match Performers Awards & Stats</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgradeClick('premium')}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                currentPlan === 'premium'
                  ? 'bg-indigo-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110'
              }`}
            >
              {currentPlan === 'premium' ? 'Currently Active' : 'Upgrade to Premium (₹51)'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Instant activation with UPI (Google Pay, PhonePe, Paytm, BHIM) • Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Deployed for:</span>
            <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              fanclub.srijandev.in
            </span>
          </div>
        </div>
      </div>

      {/* UPI Payment Activation Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Pay via UPI & Activate Plan
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Activating FanClub <span className="font-bold uppercase text-blue-600">{showUpiModal}</span> plan
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-left">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-slate-600">Total Amount:</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{showUpiModal === 'pro' ? '21' : '51'}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700 flex items-center justify-between">
                <span>VPA: <strong>fanclub@upi</strong></span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Send ₹{showUpiModal === 'pro' ? '21' : '51'} to <strong>fanclub@upi</strong> via GPay, PhonePe, or Paytm, then click Activate below.
              </div>
            </div>

            <div className="mb-4 text-left">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 412984019283"
                value={upiRefId}
                onChange={(e) => setUpiRefId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUpiModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={isVerifying}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isVerifying ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <span>Activate Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
