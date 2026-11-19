// ============================================================
// FAN CLUB — OBS Studio Live Broadcast Control Centre
// Professional TV broadcast overlays with tokenized browser source URLs
// ============================================================
import React, { useState } from 'react';
import type { Match, ObsThemeId, PlanType } from '../../types/cricket';
import { obsOverlayService } from '../../services/obsOverlayService';
import BroadcastOverlay from '../BroadcastOverlay';
import { 
  Tv, 
  Copy, 
  Check, 
  ExternalLink, 
  Monitor, 
  Sliders, 
  Sparkles, 
  Play, 
  Radio, 
  Layers, 
  Maximize2,
  Palette
} from 'lucide-react';

interface ObsControlCenterProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ObsThemeId;
  onThemeChange: (theme: ObsThemeId) => void;
  onOpenPlans: () => void;
}

export const ObsControlCenter: React.FC<ObsControlCenterProps> = ({
  match,
  currentPlan,
  currentTheme,
  onThemeChange,
  onOpenPlans,
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isChromaGreen, setIsChromaGreen] = useState(false);
  const [activeGraphicMode, setActiveGraphicMode] = useState<
    'scorebar' | 'batsmen_card' | 'bowler_card' | 'performers_card' | 'fow_card' | 'target_card'
  >('scorebar');

  // Generate live browser source URL
  const browserSourceUrl = `${window.location.origin}${window.location.pathname}?mode=overlay&theme=${currentTheme}&graphic=${activeGraphicMode}&matchId=${match.id}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(browserSourceUrl);
    setCopiedToken('copied');
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const themes: { id: ObsThemeId; name: string; subtitle: string; previewBg: string }[] = [
    {
      id: 'wcFinal',
      name: 'ICC World Cup Final',
      subtitle: 'Grand Final Gold & Navy TV HUD',
      previewBg: 'linear-gradient(135deg, #0A1628, #C9A227)',
    },
    {
      id: 'asiaCup',
      name: 'ACC Asia Cup',
      subtitle: 'Emerald Green & Platinum HUD',
      previewBg: 'linear-gradient(135deg, #0D3B2E, #2ECC71)',
    },
    {
      id: 'sunsetIPL',
      name: 'IPL Sunset Electric',
      subtitle: 'Electric Neon Violet & Sunset Orange',
      previewBg: 'linear-gradient(135deg, #1a0033, #FF6B00)',
    },
    {
      id: 'testClassic',
      name: 'Test Match Classic',
      subtitle: 'Traditional Red Ball Crimson & Gold',
      previewBg: 'linear-gradient(135deg, #1C1917, #BE123C)',
    },
    {
      id: 'teamCustom',
      name: 'Dynamic Team Color Sync',
      subtitle: 'Automatically blends with playing team kits',
      previewBg: `linear-gradient(135deg, ${(match.teamA || match.team1)?.color || '#0055A5'}, ${(match.teamB || match.team2)?.color || '#FF9933'})`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase mb-2">
              <Tv size={13} /> OBS STUDIO STREAMING ENGINE
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">OBS Broadcast Overlay Suite</h1>
            <p className="mt-1 text-slate-400 text-xs sm:text-sm max-w-2xl">
              Broadcast-grade live cricket lower-thirds and full-screen graphics for OBS Studio, vMix, and Streamlabs.
              Renders on 100% transparent canvas with zero app chrome.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={browserSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <ExternalLink size={14} /> Open Live Feed
            </a>
          </div>
        </div>

        {/* Browser Source URL Generator Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <Monitor size={13} className="text-emerald-400" /> OBS Browser Source URL (Copy & Paste into OBS)
            </div>
            <div className="font-mono text-xs text-emerald-400 truncate bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
              {browserSourceUrl}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              {copiedToken === 'copied' ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedToken === 'copied' ? 'Copied to Clipboard!' : 'Copy Browser Source URL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Themes & Controls */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Theme Chooser */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 mb-4">
              <Palette size={16} className="text-amber-400" /> Broadcast Overlay Themes
            </h3>

            <div className="space-y-3">
              {themes.map((th) => (
                <div
                  key={th.id}
                  onClick={() => onThemeChange(th.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    currentTheme === th.id
                      ? 'bg-slate-850 border-emerald-500/60 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md border border-white/20"
                    style={{ background: th.previewBg }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate">{th.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{th.subtitle}</div>
                  </div>
                  {currentTheme === th.id && (
                    <span className="text-emerald-400 font-bold text-xs">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Sliders size={16} className="text-cyan-400" /> Stream Source Settings
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Recommended Width:</span>
                <span className="font-mono text-white font-bold">1920 px</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recommended Height:</span>
                <span className="font-mono text-white font-bold">1080 px</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Background Alpha:</span>
                <span className="font-mono text-emerald-400 font-bold">100% Transparent</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-300 font-medium">Chroma Green Background</span>
              <button
                onClick={() => setIsChromaGreen(!isChromaGreen)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isChromaGreen ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isChromaGreen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Broadcast Preview Sandbox */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-extrabold text-white text-base">Live Overlay Preview Canvas</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {match.title}
              </span>
            </div>

            {/* Simulated Stream Screen */}
            <div
              className={`mt-4 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[360px] flex flex-col justify-end p-4 transition-colors ${
                isChromaGreen ? 'bg-[#00FF00]' : 'bg-slate-950'
              }`}
            >
              {/* Overlay preview container */}
              <div className="w-full">
                <BroadcastOverlay
                  match={match}
                  currentPlan={currentPlan}
                  onOpenPlans={onOpenPlans}
                  standalone={false}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Notice: In OBS Studio, add as a <strong>Browser Source</strong> and set URL to the copied link.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
