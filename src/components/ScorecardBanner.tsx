import React from 'react';
import type { Match, ThemeId } from '../types/cricket';
import { Trophy, MapPin, Activity } from 'lucide-react';

interface ScorecardBannerProps {
  match: Match;
  currentTheme: ThemeId;
}

export const ScorecardBanner: React.FC<ScorecardBannerProps> = ({
  match,
  currentTheme,
}) => {
  const currentInning = match.innings[match.currentInningIndex];
  const battingTeam = match.currentInningIndex === 0 ? match.teamA : match.teamB;
  const bowlingTeam = match.currentInningIndex === 0 ? match.teamB : match.teamA;

  const totalBallsBowled = currentInning.oversCompleted * 6 + currentInning.ballsInCurrentOver;
  const oversDecimal = `${currentInning.oversCompleted}.${currentInning.ballsInCurrentOver}`;
  const crr = totalBallsBowled > 0 ? ((currentInning.totalRuns / totalBallsBowled) * 6).toFixed(2) : '0.00';

  let rrr = '0.00';
  let targetEquation = '';
  let isTargetChasing = match.currentInningIndex === 1;

  if (isTargetChasing) {
    const firstInningRuns = match.innings[0].totalRuns;
    const target = firstInningRuns + 1;
    const runsNeeded = target - currentInning.totalRuns;
    const totalMaxBalls = match.overs * 6;
    const ballsRemaining = Math.max(0, totalMaxBalls - totalBallsBowled);

    if (runsNeeded <= 0) {
      targetEquation = `${battingTeam.name} won by ${10 - currentInning.wickets} wickets! 🏆`;
    } else if (ballsRemaining === 0 || currentInning.wickets >= 10) {
      if (runsNeeded === 1) {
        targetEquation = `MATCH TIED! Super Over needed!`;
      } else {
        targetEquation = `${bowlingTeam.name} won by ${runsNeeded - 1} runs! 🏆`;
      }
    } else {
      rrr = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
      targetEquation = `Need ${runsNeeded} runs in ${ballsRemaining} balls (RRR: ${rrr})`;
    }
  }

  const isDynamicTeam = currentTheme === 'teamCustom';
  const customColor = battingTeam.color || '#1E40AF';

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl border border-slate-200/80 bg-white mb-6">
      {/* Top Tournament & Venue Strip */}
      <div 
        className={`px-5 py-2.5 flex flex-wrap items-center justify-between text-xs font-medium border-b ${
          isDynamicTeam 
            ? 'bg-slate-900 text-white' 
            : currentTheme === 'wcFinal'
            ? 'bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white border-amber-500/30'
            : currentTheme === 'asiaCup'
            ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white border-emerald-500/30'
            : currentTheme === 'sunsetIPL'
            ? 'bg-gradient-to-r from-orange-950 via-rose-950 to-indigo-950 text-white border-orange-500/30'
            : 'bg-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold tracking-wide uppercase text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {match.title}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{match.matchType} ({match.overs} Overs)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-white/70 text-[11px]">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{match.venue}</span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> LIVE
          </span>
        </div>
      </div>

      {/* Main Score Area */}
      <div 
        className="p-5 sm:p-7 relative transition-all"
        style={
          isDynamicTeam
            ? {
                background: `linear-gradient(135deg, ${customColor}15 0%, #FFFFFF 60%)`,
                borderLeft: `6px solid ${customColor}`
              }
            : currentTheme === 'wcFinal'
            ? {
                background: 'linear-gradient(135deg, #EFF6FF 0%, #FAF5FF 50%, #FFFBEB 100%)',
                borderLeft: '6px solid #F59E0B'
              }
            : currentTheme === 'asiaCup'
            ? {
                background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 50%, #FEFCE8 100%)',
                borderLeft: '6px solid #059669'
              }
            : currentTheme === 'sunsetIPL'
            ? {
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF1F2 50%, #EEF2FF 100%)',
                borderLeft: '6px solid #EA580C'
              }
            : {
                background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
                borderLeft: '6px solid #16A34A'
              }
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Team A Details */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div 
              className="relative w-16 h-16 rounded-2xl p-1 shadow-md flex items-center justify-center shrink-0 border-2"
              style={{ borderColor: match.teamA.color, backgroundColor: `${match.teamA.color}15` }}
            >
              <div 
                className="w-full h-full rounded-xl flex items-center justify-center font-black text-lg text-white shadow-inner"
                style={{ backgroundColor: match.teamA.color }}
              >
                {match.teamA.shortName}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                  {match.teamA.name}
                </h3>
                {match.currentInningIndex === 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div className="text-sm font-semibold text-slate-600 mt-0.5">
                {match.innings[0].totalRuns}/{match.innings[0].wickets}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({match.innings[0].oversCompleted}.{match.innings[0].ballsInCurrentOver} ov)
                </span>
              </div>
              {match.tossWinnerId === match.teamA.id && (
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Toss: Won ({match.tossDecision})
                </div>
              )}
            </div>
          </div>

          {/* VS / Score Hub */}
          <div className="md:col-span-4 text-center bg-white/80 backdrop-blur-xs p-4 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Active Inning: {battingTeam.shortName} Batting
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span 
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{ color: isDynamicTeam ? customColor : currentTheme === 'wcFinal' ? '#1E3A8A' : currentTheme === 'asiaCup' ? '#064E3B' : '#0F172A' }}
              >
                {currentInning.totalRuns}/{currentInning.wickets}
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-600">
                ({oversDecimal} / {match.overs} ov)
              </span>
            </div>

            {/* Run Rate Tags */}
            <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                CRR: {crr}
              </span>
              {isTargetChasing && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  RRR: {rrr}
                </span>
              )}
            </div>

            {/* Target Equation Pill */}
            {isTargetChasing && targetEquation && (
              <div className="mt-2.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 text-amber-900 border border-amber-300 text-xs font-bold">
                {targetEquation}
              </div>
            )}
          </div>

          {/* Team B Details */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-4">
            <div className="text-left md:text-right order-2 md:order-1">
              <div className="flex items-center md:justify-end gap-2">
                {match.currentInningIndex === 1 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                  {match.teamB.name}
                </h3>
              </div>
              <div className="text-sm font-semibold text-slate-600 mt-0.5">
                {match.currentInningIndex === 1 
                  ? `${currentInning.totalRuns}/${currentInning.wickets}`
                  : 'Yet to bat'}
                {match.currentInningIndex === 1 && (
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({match.innings[1].oversCompleted}.{match.innings[1].ballsInCurrentOver} ov)
                  </span>
                )}
              </div>
              {match.tossWinnerId === match.teamB.id && (
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Toss: Won ({match.tossDecision})
                </div>
              )}
            </div>
            <div 
              className="relative w-16 h-16 rounded-2xl p-1 shadow-md flex items-center justify-center shrink-0 border-2 order-1 md:order-2"
              style={{ borderColor: match.teamB.color, backgroundColor: `${match.teamB.color}15` }}
            >
              <div 
                className="w-full h-full rounded-xl flex items-center justify-center font-black text-lg text-white shadow-inner"
                style={{ backgroundColor: match.teamB.color }}
              >
                {match.teamB.shortName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
