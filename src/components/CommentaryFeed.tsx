import React from 'react';
import type { Match, PlanType, ThemeId } from '../types/cricket';
import { generateAiMatchInsights } from '../utils/commentaryGenerator';
import { Brain, Crown } from 'lucide-react';

interface CommentaryFeedProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const currentInning = match.innings[match.currentInningIndex];

  const totalBalls = match.overs * 6;
  const bowledBalls = currentInning.oversCompleted * 6 + currentInning.ballsInCurrentOver;
  const remainingBalls = Math.max(0, totalBalls - bowledBalls);

  const target = match.innings[0].totalRuns + 1;
  const crr = bowledBalls > 0 ? (currentInning.totalRuns / bowledBalls) * 6 : 0;
  const rrr = remainingBalls > 0 ? ((target - currentInning.totalRuns) / remainingBalls) * 6 : 0;

  const aiInsights = generateAiMatchInsights(
    match.teamA.name,
    match.teamB.name,
    target,
    currentInning.totalRuns,
    currentInning.wickets,
    remainingBalls,
    crr,
    rrr
  );

  // Reverse balls for live commentary feed (latest first)
  const sortedBalls = [...currentInning.balls].reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* AI Match Insights / Win Predictor Widget */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-5 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Brain className="w-4 h-4 text-amber-400" />
              FanClub AI Engine
            </span>
            {currentPlan !== 'premium' ? (
              <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                VIP Feature
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active VIP
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-1">
            Live Match Win Predictor
          </h3>
          <p className="text-xs text-blue-200/80 mb-4">
            Real-time DLS algorithmic probabilities calculated per ball.
          </p>

          {/* Win Probability Bar */}
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 mb-4">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-blue-300">{match.teamA.shortName}: {aiInsights.winProbabilityA}%</span>
              <span className="text-amber-300">{match.teamB.shortName}: {aiInsights.winProbabilityB}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${aiInsights.winProbabilityA}%` }}
              />
              <div 
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${aiInsights.winProbabilityB}%` }}
              />
            </div>
          </div>

          {/* Tactical Commentary Box */}
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-xs space-y-2">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">AI Tactical Analysis</span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {aiInsights.insight}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Key Battle:</span>
              <span className="text-amber-300 font-semibold">{aiInsights.keyBattle}</span>
            </div>
          </div>

          {currentPlan !== 'premium' && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={onOpenPlans}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Unlock Full AI & Dynamic Theming (₹51)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ball by Ball Commentary Feed */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Ball-by-Ball Live Commentary
            </h3>
            <p className="text-xs text-slate-500">
              Real-time blow-by-blow match action with Hindi & English highlights
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {sortedBalls.length} Events Logged
          </span>
        </div>

        {sortedBalls.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No balls recorded in this inning yet. Score runs or dots to see live commentary.
          </div>
        ) : (
          <div className="space-y-3.5">
            {sortedBalls.map((ball) => (
              <div 
                key={ball.id} 
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/70 transition-colors"
              >
                {/* Over & Ball Badge */}
                <div className="shrink-0 text-center">
                  <div className="text-xs font-black text-slate-700 font-mono">
                    {ball.overIndex}.{ball.ballInOver}
                  </div>
                  <span
                    className={`mt-1 inline-flex w-7 h-7 rounded-full items-center justify-center font-black text-xs shadow-xs ${
                      ball.isWicket
                        ? 'bg-rose-600 text-white'
                        : ball.runsOffBat === 6
                        ? 'bg-purple-600 text-white'
                        : ball.runsOffBat === 4
                        ? 'bg-emerald-600 text-white'
                        : ball.extraType !== 'none'
                        ? 'bg-amber-400 text-slate-950 text-[10px]'
                        : ball.runsOffBat === 0
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {ball.isWicket ? 'W' : ball.extraType === 'wide' ? 'Wd' : ball.extraType === 'no_ball' ? 'Nb' : ball.runsOffBat}
                  </span>
                </div>

                {/* Commentary Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {ball.bowlerName} to {ball.strikerName}
                    </span>
                    {ball.wagonDirection && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.2 rounded-md">
                        {ball.wagonDirection.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {ball.commentary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
