import React, { useState } from 'react';
import type { Match, PlanType, ThemeId } from '../types/cricket';
import { Tv, Copy, Crown } from 'lucide-react';

interface BroadcastOverlayProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [useGreenScreen, setUseGreenScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentInning = match.innings[match.currentInningIndex];
  const battingTeam = match.currentInningIndex === 0 ? match.teamA : match.teamB;

  const striker = currentInning.batsmen.find(b => b.playerId === currentInning.currentStrikerId);
  const nonStriker = currentInning.batsmen.find(b => b.playerId === currentInning.currentNonStrikerId);
  const currentBowler = currentInning.bowlers.find(b => b.playerId === currentInning.currentBowlerId);

  const totalBallsBowled = currentInning.oversCompleted * 6 + currentInning.ballsInCurrentOver;
  const crr = totalBallsBowled > 0 ? ((currentInning.totalRuns / totalBallsBowled) * 6).toFixed(2) : '0.00';

  let targetEquation = '';
  if (match.currentInningIndex === 1) {
    const target = match.innings[0].totalRuns + 1;
    const runsNeeded = target - currentInning.totalRuns;
    const ballsRemaining = Math.max(0, match.overs * 6 - totalBallsBowled);
    targetEquation = runsNeeded > 0 ? `NEED ${runsNeeded} RUNS IN ${ballsRemaining} BALLS` : `${battingTeam.shortName} WON THE MATCH!`;
  }

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText('https://fanclub.srijandev.in/overlay');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLocked = currentPlan !== 'premium';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-600" />
              Live Broadcast Stream Graphics (OBS / YouTube)
            </h3>
            <span className="text-[10px] font-bold uppercase bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
              VIP Overlay
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Professional TV broadcast graphics overlay designed for live YouTube & local cricket streaming.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useGreenScreen}
              onChange={(e) => setUseGreenScreen(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Chroma Green Background</span>
          </label>

          <button
            onClick={handleCopyObsUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied OBS URL!' : 'Copy OBS Browser Source URL'}</span>
          </button>
        </div>
      </div>

      {/* Broadcast Preview Canvas */}
      <div 
        className={`w-full rounded-2xl p-6 relative min-h-[300px] flex flex-col justify-end transition-colors ${
          useGreenScreen ? 'bg-[#00FF00]' : 'bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]'
        }`}
      >
        {/* Pitch / Action Watermark */}
        <div className="absolute top-4 left-6 flex items-center gap-3 text-white/80">
          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
            LIVE BROADCAST
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            fanclub.srijandev.in
          </span>
        </div>

        {/* The Graphic Lower Third / Score Ribbon */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white animate-fadeIn">
          {/* Top Line of Overlay: Match Context & Equation */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wide uppercase border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">★ {match.title}</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300">{match.venue}</span>
            </div>
            {targetEquation && (
              <span className="text-amber-300 font-extrabold animate-pulse">
                {targetEquation}
              </span>
            )}
          </div>

          {/* Core Score Ticker */}
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Team Score */}
            <div className="md:col-span-4 flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/10 pb-2 md:pb-0">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md shrink-0"
                style={{ backgroundColor: battingTeam.color }}
              >
                {battingTeam.shortName}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {currentInning.totalRuns}/{currentInning.wickets}
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    ({currentInning.oversCompleted}.{currentInning.ballsInCurrentOver}/{match.overs})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  CRR: <strong className="text-white">{crr}</strong>
                </div>
              </div>
            </div>

            {/* Active Batsmen */}
            <div className="md:col-span-5 space-y-1 text-xs border-b md:border-b-0 md:border-r border-white/10 pb-2 md:pb-0 md:pr-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <span>▶ {striker?.name || 'Striker'}</span>
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded">*</span>
                </span>
                <span className="font-black text-white">
                  {striker?.runs || 0} <span className="text-[10px] text-slate-400 font-normal">({striker?.balls || 0})</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>{nonStriker?.name || 'Non-Striker'}</span>
                <span className="font-bold">
                  {nonStriker?.runs || 0} <span className="text-[10px] text-slate-400 font-normal">({nonStriker?.balls || 0})</span>
                </span>
              </div>
            </div>

            {/* Current Bowler */}
            <div className="md:col-span-3 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Bowling</div>
              <div className="font-bold text-white truncate">
                {currentBowler?.name || 'Bowler'}
              </div>
              <div className="text-[11px] font-semibold text-blue-300">
                {currentBowler?.wickets || 0}-{currentBowler?.runsConceded || 0} ({currentBowler?.overs || 0} ov)
              </div>
            </div>
          </div>
        </div>

        {/* Locked Overlay for Non-Premium */}
        {isLocked && (
          <div className="absolute inset-0 rounded-2xl bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-lg">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <h4 className="text-lg font-bold">Broadcast HUD is a FanClub Premium Feature</h4>
            <p className="text-xs text-slate-300 max-w-sm mt-1 mb-4">
              Stream live matches on YouTube, Facebook or OBS with live TV-grade lower-third graphics and auto-updating scores for just ₹51/month.
            </p>
            <button
              onClick={onOpenPlans}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>Upgrade to FanClub Premium (₹51/Month)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
