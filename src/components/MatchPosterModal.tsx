import React from 'react';
import type { Match, PlanType } from '../types/cricket';
import { Trophy, Award, Star, Share2, Download, X, Crown, Sparkles } from 'lucide-react';

interface MatchPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

export const MatchPosterModal: React.FC<MatchPosterModalProps> = ({
  isOpen,
  onClose,
  match,
  currentPlan,
  onOpenPlans,
}) => {
  if (!isOpen) return null;

  // Compute best batsman across both innings
  const allBatsmen = [
    ...match.innings[0].batsmen.map(b => ({ ...b, team: match.teamA.shortName })),
    ...match.innings[1].batsmen.map(b => ({ ...b, team: match.teamB.shortName }))
  ];
  const topBatsman = [...allBatsmen].sort((a, b) => b.runs - a.runs)[0];

  // Compute best bowler across both innings
  const allBowlers = [
    ...match.innings[0].bowlers.map(b => ({ ...b, team: match.teamB.shortName })),
    ...match.innings[1].bowlers.map(b => ({ ...b, team: match.teamA.shortName }))
  ];
  const topBowler = [...allBowlers].sort((a, b) => {
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    return a.runsConceded - b.runsConceded;
  })[0];

  // Determine winner or leader
  const inning1Runs = match.innings[0].totalRuns;
  const inning2Runs = match.innings[1].totalRuns;
  const winningTeam = inning1Runs >= inning2Runs ? match.teamA : match.teamB;

  const handleShare = () => {
    const text = `🏆 *FanClub Match MVP & Highlights* 🏆\n*${match.title}*\n${match.teamA.name}: ${match.innings[0].totalRuns}/${match.innings[0].wickets}\n${match.teamB.name}: ${match.innings[1].totalRuns}/${match.innings[1].wickets}\n★ Player of the Match: ${topBatsman ? `${topBatsman.name} (${topBatsman.runs} runs)` : 'N/A'}\n★ Best Bowler: ${topBowler ? `${topBowler.name} (${topBowler.wickets}-${topBowler.runsConceded})` : 'N/A'}\nFull scorecard on: https://fanclub.srijandev.in`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-sm tracking-wide">Match MVP & Story Poster</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* The Graphic Poster Canvas */}
        <div className="p-6 overflow-y-auto flex flex-col items-center">
          <div 
            id="match-poster-card" 
            className="w-full rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-center"
          >
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-amber-400 mb-4 pb-3 border-b border-white/10">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> FANCLUB OFFICIAL
              </span>
              <span className="text-white/60 font-mono text-[10px]">fanclub.srijandev.in</span>
            </div>

            {/* Match Title & Venue */}
            <h3 className="text-xl font-black tracking-tight text-white mb-1">
              {match.title}
            </h3>
            <p className="text-xs text-blue-200/80 mb-5 font-medium">
              {match.venue} • {match.matchType} ({match.overs} Ov)
            </p>

            {/* Grand Scores Box */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <div className="text-left">
                <span className="text-xs font-bold text-amber-300 block">{match.teamA.name}</span>
                <span className="text-2xl font-black text-white">
                  {match.innings[0].totalRuns}/{match.innings[0].wickets}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  ({match.innings[0].oversCompleted}.{match.innings[0].ballsInCurrentOver} Ov)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-300 block">{match.teamB.name}</span>
                <span className="text-2xl font-black text-white">
                  {match.innings[1].totalRuns}/{match.innings[1].wickets}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  ({match.innings[1].oversCompleted}.{match.innings[1].ballsInCurrentOver} Ov)
                </span>
              </div>
            </div>

            {/* MVP / Player of the Match Spotlight */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 p-4 rounded-2xl border border-amber-400/50 mb-4 relative">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2 shadow-sm">
                <Award className="w-3 h-3" /> PLAYER OF THE MATCH
              </div>
              <h4 className="text-lg font-black text-white">
                {topBatsman ? topBatsman.name : 'Match MVP'}
              </h4>
              <p className="text-xs text-amber-200 font-bold mt-0.5">
                {topBatsman ? `${topBatsman.runs} Runs (${topBatsman.balls} balls, ${topBatsman.fours}x4, ${topBatsman.sixes}x6)` : 'Outstanding Match Performance'}
              </p>
            </div>

            {/* Top Bowler Honor */}
            {topBowler && (
              <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-300 font-medium">🎯 Best Bowling:</span>
                <span className="font-bold text-white">
                  {topBowler.name} ({topBowler.wickets} for {topBowler.runsConceded})
                </span>
              </div>
            )}

            {/* Footer Watermark */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Created with FanClub Cricket App • Based on CricHeroes</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share MVP on WhatsApp</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export / Print Poster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
