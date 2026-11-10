import React, { useState } from 'react';
import type { PlanType } from '../types/cricket';
import { Check, Sparkles, Crown, Zap, Shield, X, QrCode } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleUpgrade = (plan: PlanType) => {
    if (plan === 'free') {
      onSelectPlan('free');
      onClose();
      return;
    }
    setShowUpiModal(plan);
  };

  const confirmMockPayment = () => {
    if (showUpiModal) {
      onSelectPlan(showUpiModal);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowUpiModal(null);
      onClose();
    }
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
                  <span>Flagship World Cup & Asia Cup light themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 2 active matches storage</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Interactive Wagon Wheel pitch</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Custom Dynamic Team Color themes</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>AI Win Predictor & Broadcast HUD</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade('free')}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPlan === 'free'
                  ? 'bg-slate-200 text-slate-700 cursor-default'
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              {currentPlan === 'free' ? 'Currently Active' : 'Switch to Free'}
            </button>
          </div>

          {/* PRO PLAN - ₹21 / month */}
          <div className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all relative ${
            currentPlan === 'pro' 
              ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-100 shadow-lg' 
              : 'border-amber-300 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-400'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> Popular Value
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 mt-1">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" /> Pro Scorer
                </span>
                {currentPlan === 'pro' && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                    Active Plan
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">Pro Plan</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-amber-600">₹21</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                For serious local teams, school leagues & tournament scorers.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Everything in Free +</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Interactive Wagon Wheel</strong> shot selector</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Ball-by-ball realistic Hindi/Eng commentary</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>WhatsApp Scorecard Share</strong> & PDF Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sunset IPL Night & Custom Tournament themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Ad-Free uninterrupted scoring</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  <span>AI Win Predictor & Broadcast Streaming HUD</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade('pro')}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                currentPlan === 'pro'
                  ? 'bg-amber-500 text-white cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-105'
              }`}
            >
              {currentPlan === 'pro' ? 'Currently Active' : 'Upgrade to Pro (₹21)'}
            </button>
          </div>

          {/* PREMIUM PLAN - ₹51 / month */}
          <div className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all relative ${
            currentPlan === 'premium' 
              ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-100 shadow-xl' 
              : 'border-indigo-300 bg-gradient-to-b from-indigo-50/30 to-white hover:border-indigo-500'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" /> All Features Unlocked
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 mt-1">
                <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-indigo-100 text-indigo-900 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-indigo-600" /> FanClub VIP
                </span>
                {currentPlan === 'premium' && (
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-200 px-2 py-0.5 rounded-full">
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
                The ultimate cricket suite with dynamic team branding & broadcast overlay.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-indigo-900">All Pro Features +</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Dynamic Team Color Theming</strong> (Syncs with team logo!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>AI Match Win Predictor</strong> & Tactical Insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Full Tournament Suite</strong> (Points Table & NRR Auto Calc)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Live Broadcast Overlay HUD</strong> (OBS / YouTube Stream Mode)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Man of the Match & Milestone Trophy Posters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Match history & cloud backups</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade('premium')}
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
            <span>Instant activation with UPI (Google Pay, PhonePe, Paytm) • Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Deployed for:</span>
            <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              fanclub.srijandev.in
            </span>
          </div>
        </div>
      </div>

      {/* Mock UPI Checkout Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Complete Payment via UPI
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upgrading to <span className="font-bold uppercase text-slate-700">{showUpiModal}</span> plan
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
              <div className="text-2xl font-black text-slate-900">
                ₹{showUpiModal === 'pro' ? '21' : '51'}
                <span className="text-xs font-normal text-slate-500"> / month</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                VPA: fanclub@upi • fanclub.srijandev.in
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUpiModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmMockPayment}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Simulate Pay ₹{showUpiModal === 'pro' ? '21' : '51'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
