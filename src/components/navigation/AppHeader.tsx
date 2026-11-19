// ============================================================
// FAN CLUB — Master Application Header & Navigation Bar
// Daytime Light Theme with High Contrast & Quick 0/0 Reset
// ============================================================
import React from 'react';
import { FanClubLogo } from '../branding/FanClubLogo';
import { 
  Radio, 
  Database, 
  Users, 
  Trophy, 
  Tv, 
  Activity, 
  BarChart3, 
  MessageSquare, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Globe2, 
  Search,
  User as UserIcon,
  Crown,
  HeartHandshake,
  RotateCcw
} from 'lucide-react';
import type { PlanType } from '../../types/cricket';
import { i18nService, type LanguageCode } from '../../services/i18n';

export type MainNavTab = 
  | 'scoring'
  | 'live'
  | 'grassroots'
  | 'migration'
  | 'players'
  | 'teams'
  | 'tournaments'
  | 'obs'
  | 'community'
  | 'rankings'
  | 'admin';

interface AppHeaderProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  currentPlan: PlanType;
  onOpenPlans: () => void;
  onOpenNewMatch: () => void;
  onResetMatch?: () => void;
  onOpenAuth: () => void;
  currentUser: any;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMatchLive?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  currentPlan,
  onOpenPlans,
  onOpenNewMatch,
  onResetMatch,
  onOpenAuth,
  currentUser,
  currentLang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  isMatchLive = true,
}) => {
  const t = (key: Parameters<typeof i18nService.t>[0]) => i18nService.t(key, currentLang);

  const navItems: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: string; highlight?: boolean }[] = [
    { id: 'scoring', label: t('scoringPad'), icon: <Activity size={15} /> },
    { id: 'live', label: t('liveMatches'), icon: <Radio size={15} className="text-rose-600 animate-pulse" />, badge: 'LIVE' },
    { id: 'grassroots', label: 'Grassroots Hub', icon: <HeartHandshake size={15} className="text-emerald-600" />, badge: 'NEW', highlight: true },
    { id: 'migration', label: t('cricHeroesMigration'), icon: <Database size={15} className="text-emerald-600" />, badge: 'AUTO' },
    { id: 'players', label: t('playerDatabase'), icon: <Users size={15} /> },
    { id: 'teams', label: t('teamsClubs'), icon: <ShieldCheck size={15} /> },
    { id: 'tournaments', label: t('tournaments'), icon: <Trophy size={15} /> },
    { id: 'obs', label: t('obsOverlays'), icon: <Tv size={15} className="text-amber-600" /> },
    { id: 'rankings', label: t('analytics'), icon: <BarChart3 size={15} /> },
    { id: 'community', label: t('community'), icon: <MessageSquare size={15} /> },
    { id: 'admin', label: t('adminPanel'), icon: <Crown size={15} className="text-purple-600" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('scoring')}>
          <FanClubLogo size="md" showSubtitle={true} />
        </div>

        {/* Global Cricket Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
          />
        </div>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(currentLang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
            title="Switch Language (English / हिंदी)"
          >
            <Globe2 size={13} />
            <span>{currentLang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Plan Badge / Upgrade */}
          <button
            onClick={onOpenPlans}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-sm ${
              currentPlan === 'premium'
                ? 'bg-amber-400 text-amber-950 border border-amber-500'
                : currentPlan === 'pro'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Sparkles size={12} />
            <span>{currentPlan}</span>
          </button>

          {/* Quick Reset Match (0/0) */}
          {onResetMatch && (
            <button
              onClick={onResetMatch}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all"
              title="Reset Match Score to 0/0"
            >
              <RotateCcw size={12} />
              <span>Reset 0/0</span>
            </button>
          )}

          {/* Quick Start New Match */}
          <button
            onClick={onOpenNewMatch}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>{t('newMatch')}</span>
          </button>

          {/* User Account / Auth */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon size={12} />}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-slate-900 truncate max-w-[95px] text-[11px] leading-tight">
                {currentUser?.name || 'Sign In'}
              </span>
              <span className="text-[9px] text-emerald-700 font-extrabold uppercase leading-tight">
                {currentUser?.role?.replace('_', ' ') || 'OTP Login'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Navigation Ribbon */}
      <nav className="border-t border-slate-200 bg-slate-50/70 px-3 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-1.5 py-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                } ${item.highlight && !isActive ? 'ring-1 ring-emerald-400/40 text-emerald-700 bg-emerald-50/50' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'LIVE'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
