import React from 'react';
import type { PlanType, ThemeId } from '../types/cricket';
import { 
  Crown, 
  Zap, 
  Layers, 
  PlusCircle, 
  Radio, 
  RotateCcw,
  Sparkles,
  PieChart,
  Tv,
  TableProperties,
  Palette
} from 'lucide-react';

interface HeaderProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  currentPlan: PlanType;
  onOpenPlans: () => void;
  activeTab: 'scoring' | 'scorecard' | 'commentary' | 'wagon' | 'tournament' | 'broadcast';
  setActiveTab: (tab: 'scoring' | 'scorecard' | 'commentary' | 'wagon' | 'tournament' | 'broadcast') => void;
  onNewMatch: () => void;
  onResetDemo: () => void;
  teamAColor: string;
  teamBColor: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onSelectTheme,
  currentPlan,
  onOpenPlans,
  activeTab,
  setActiveTab,
  onNewMatch,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Bar with Brand, Theme Picker & Plan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-400 text-white shadow-md shadow-blue-500/20">
            <span className="font-black text-xl tracking-tighter">FC</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[8px] font-bold">
              ●
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                FanClub
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 border border-amber-300">
                PRO SCORING
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              CricHeroes-Powered Web App • World Cup & Asia Cup Light Themes
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selector Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors">
              <Palette className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={currentTheme}
                onChange={(e) => onSelectTheme(e.target.value as ThemeId)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="wcFinal">🏆 World Cup Final</option>
                <option value="asiaCup">🌿 Asia Cup Prestige</option>
                <option value="cricHeroes">🏏 CricHeroes Classic</option>
                <option value="sunsetIPL">🌅 Sunset Premier League</option>
                <option value="teamCustom">🎨 Dynamic Team Colors</option>
              </select>
            </div>
          </div>

          {/* Plan Membership Pill */}
          <button
            onClick={onOpenPlans}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentPlan === 'premium'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110 ring-2 ring-indigo-200'
                : currentPlan === 'pro'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-105 ring-2 ring-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {currentPlan === 'premium' ? (
              <>
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Premium VIP (₹51)</span>
              </>
            ) : currentPlan === 'pro' ? (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Pro Scorer (₹21)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Free Plan • Upgrade</span>
              </>
            )}
          </button>

          {/* New Match Button */}
          <button
            onClick={onNewMatch}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Start New Cricket Match"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Match</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to World Cup Final Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/90 border-t border-slate-200/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1 text-xs">
          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Live Scoring</span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab('commentary')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'commentary'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Commentary & AI Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('wagon')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'wagon'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-amber-500" />
            <span>Wagon Wheel</span>
            {currentPlan === 'free' && (
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                PRO
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tournament')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tournament'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 text-emerald-600" />
            <span>Points Table (NRR)</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-indigo-600" />
            <span>Broadcast Stream Overlay (OBS)</span>
            <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded font-bold">
              VIP
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
