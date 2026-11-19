// ============================================================
// FAN CLUB — Master Application Header & Navigation Bar
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
  HeartHandshake
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
    { id: 'live', label: t('liveMatches'), icon: <Radio size={15} className="text-red-500 animate-pulse" />, badge: 'LIVE' },
    { id: 'grassroots', label: 'Grassroots Hub', icon: <HeartHandshake size={15} className="text-emerald-400" />, badge: 'NEW', highlight: true },
    { id: 'migration', label: t('cricHeroesMigration'), icon: <Database size={15} className="text-emerald-400" />, badge: 'AUTO' },
    { id: 'players', label: t('playerDatabase'), icon: <Users size={15} /> },
    { id: 'teams', label: t('teamsClubs'), icon: <ShieldCheck size={15} /> },
    { id: 'tournaments', label: t('tournaments'), icon: <Trophy size={15} /> },
    { id: 'obs', label: t('obsOverlays'), icon: <Tv size={15} className="text-amber-400" /> },
    { id: 'rankings', label: t('analytics'), icon: <BarChart3 size={15} /> },
    { id: 'community', label: t('community'), icon: <MessageSquare size={15} /> },
    { id: 'admin', label: t('adminPanel'), icon: <Crown size={15} className="text-purple-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
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
            className="w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(currentLang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
            title="Switch Language (English / हिंदी)"
          >
            <Globe2 size={13} />
            <span>{currentLang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Plan Badge / Upgrade */}
          <button
            onClick={onOpenPlans}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider transition-transform active:scale-95 ${
              currentPlan === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20'
                : currentPlan === 'pro'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Sparkles size={12} />
            <span>{currentPlan}</span>
          </button>

          {/* Quick Start New Match */}
          <button
            onClick={onOpenNewMatch}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>{t('newMatch')}</span>
          </button>

          {/* User Account / Auth */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon size={13} />}
            </div>
            <span className="hidden sm:inline font-semibold text-slate-200 truncate max-w-[100px]">
              {currentUser ? currentUser.name : 'Sign In'}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Ribbon */}
      <nav className="border-t border-slate-850 bg-slate-950 px-3 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                } ${item.highlight ? 'ring-1 ring-emerald-500/30' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                      item.badge === 'LIVE'
                        ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
