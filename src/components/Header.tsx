import { useState, useRef, useEffect } from 'react';
import {
  Activity,
  LayoutList,
  TrendingUp,
  Target,
  MessageSquare,
  Trophy,
  Users,
  Radio,
  Info,
  Plus,
  RotateCcw,
  ChevronDown,
  Zap,
  Star,
  Tv2,
} from 'lucide-react';
import type { PlanType, ObsThemeId } from '../types/cricket';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActiveTabType =
  | 'scoring'
  | 'scorecard'
  | 'analytics'
  | 'wagon'
  | 'commentary'
  | 'tournament'
  | 'teams'
  | 'broadcast'
  | 'info';

interface HeaderProps {
  currentPlan: PlanType;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenPlans: () => void;
  onNewMatch: () => void;
  onResetMatch: () => void;
  currentObsTheme: ObsThemeId;
  onSelectObsTheme: (theme: ObsThemeId) => void;
  matchTitle: string;
  matchStatus: string;
  teamAColor: string;
  teamBColor: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: Array<{ id: ActiveTabType; label: string; icon: React.ReactNode }> = [
  { id: 'scoring',     label: 'Score',       icon: <Activity     size={14} /> },
  { id: 'scorecard',   label: 'Scorecard',   icon: <LayoutList   size={14} /> },
  { id: 'analytics',   label: 'Analytics',   icon: <TrendingUp   size={14} /> },
  { id: 'wagon',       label: 'Wagon Wheel', icon: <Target       size={14} /> },
  { id: 'commentary',  label: 'Commentary',  icon: <MessageSquare size={14} /> },
  { id: 'tournament',  label: 'Tournament',  icon: <Trophy       size={14} /> },
  { id: 'teams',       label: 'Teams',       icon: <Users        size={14} /> },
  { id: 'broadcast',   label: 'OBS Broadcast', icon: <Radio      size={14} /> },
  { id: 'info',        label: 'Match Info',  icon: <Info         size={14} /> },
];

const OBS_THEMES: Array<{ id: ObsThemeId; label: string; emoji: string }> = [
  { id: 'wcFinal',    label: 'World Cup',    emoji: '🏆' },
  { id: 'asiaCup',    label: 'Asia Cup',     emoji: '🌿' },
  { id: 'sunsetIPL',  label: 'T20 Premier',  emoji: '🌅' },
  { id: 'teamCustom', label: 'Team Colors',  emoji: '🎨' },
];

// ── Plan Badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan, onClick }: { plan: PlanType; onClick: () => void }) {
  if (plan === 'free') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition-colors"
      >
        <Zap size={11} />
        FREE
      </button>
    );
  }
  if (plan === 'pro') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-200 transition-colors"
      >
        <Star size={11} />
        PRO
      </button>
    );
  }
  // premium — gold gradient
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-400 text-yellow-800 hover:opacity-90 transition-opacity"
      style={{ background: 'linear-gradient(135deg, #fde68a, #f59e0b)' }}
    >
      <Star size={11} />
      PREMIUM
    </button>
  );
}

// ── OBS Theme Dropdown ────────────────────────────────────────────────────────

function ObsThemeDropdown({
  currentTheme,
  onSelect,
}: {
  currentTheme: ObsThemeId;
  onSelect: (theme: ObsThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = OBS_THEMES.find((t) => t.id === currentTheme) ?? OBS_THEMES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="OBS Broadcast Theme"
      >
        <Tv2 size={13} className="text-slate-500" />
        <span className="hidden sm:inline">{active.emoji} {active.label}</span>
        <span className="sm:hidden">{active.emoji}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OBS Theme</p>
          </div>
          {OBS_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => { onSelect(theme.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                theme.id === currentTheme
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{theme.emoji}</span>
              <span>{theme.label}</span>
              {theme.id === currentTheme && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Header Component ─────────────────────────────────────────────────────

export default function Header({
  currentPlan,
  activeTab,
  setActiveTab,
  onOpenPlans,
  onNewMatch,
  onResetMatch,
  currentObsTheme,
  onSelectObsTheme,
  matchTitle,
  matchStatus,
  teamAColor,
  teamBColor,
}: HeaderProps) {
  const isLive = matchStatus === 'live';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* ── Top Row ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-4 h-14 gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cricket bat icon using two colored team dots + SVG bat */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-md">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {/* Bat blade */}
              <path d="M5 19 L15 5" />
              <path d="M5 19 L9 23" />
              <path d="M9 23 L13 19" />
              {/* Ball */}
              <circle cx="17" cy="7" r="3" />
            </svg>
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">FanClub</span>
              {/* Colour accent dots for team colours */}
              <span
                className="w-2 h-2 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: teamAColor || '#3b82f6' }}
              />
              <span
                className="w-2 h-2 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: teamBColor || '#ef4444' }}
              />
            </div>
            <p className="text-xs text-slate-400 font-medium -mt-0.5">Cricket Scoring & Broadcast</p>
          </div>
        </div>

        {/* Match title pill (center, hidden on small screens) */}
        {matchTitle && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 max-w-xs truncate">
            {isLive && (
              <span className="flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
            <span className="text-xs font-semibold text-slate-700 truncate">{matchTitle}</span>
            {isLive && (
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide shrink-0">LIVE</span>
            )}
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PlanBadge plan={currentPlan} onClick={onOpenPlans} />

          <button
            onClick={onOpenPlans}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
          >
            <Zap size={12} />
            Upgrade
          </button>

          <button
            onClick={onNewMatch}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span className="hidden xs:inline">New Match</span>
            <span className="xs:hidden">New</span>
          </button>

          <ObsThemeDropdown currentTheme={currentObsTheme} onSelect={onSelectObsTheme} />

          <button
            onClick={onResetMatch}
            title="Reset Match"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <nav
        className="flex items-stretch overflow-x-auto scrollbar-none border-t border-slate-100 bg-white"
        aria-label="Main navigation"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5
                text-xs font-bold whitespace-nowrap shrink-0
                transition-colors duration-150 group
                ${isActive
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`transition-colors duration-150 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {tab.icon}
              </span>
              {tab.label}

              {/* Active bottom border indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-blue-600"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
