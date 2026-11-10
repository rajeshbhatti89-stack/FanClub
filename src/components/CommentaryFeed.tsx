import React, { useState } from 'react';
import type { Match, PlanType, ExtraType, WicketType } from '../types/cricket';
import { MessageSquare, Filter, Share2, Search, ArrowDown } from 'lucide-react';

interface CommentaryFeedProps {
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

type FilterType = 'all' | 'wickets' | 'fours' | 'sixes' | 'extras' | 'dots';

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [activeInningIdx, setActiveInningIdx] = useState<0 | 1>(match.currentInningIndex);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedInning = match.innings[activeInningIdx];
  const battingTeam = activeInningIdx === 0 ? match.teamA : match.teamB;
  const allBalls = selectedInning.balls || [];

  // Filter balls
  const filteredBalls = allBalls.filter(ball => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (ball.commentary || '').toLowerCase().includes(q) ||
        ball.strikerName.toLowerCase().includes(q) ||
        ball.bowlerName.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    if (activeFilter === 'wickets') return ball.isWicket;
    if (activeFilter === 'fours') return ball.runsOffBat === 4;
    if (activeFilter === 'sixes') return ball.runsOffBat === 6;
    if (activeFilter === 'extras') return ball.extraType !== 'none';
    if (activeFilter === 'dots') return ball.runsOffBat === 0 && ball.extraRuns === 0 && ball.isLegalBall && !ball.isWicket;
    return true;
  });

  // Reverse order (most recent ball at top)
  const displayBalls = [...filteredBalls].reverse();

  const handleShareCommentary = () => {
    const lastBalls = allBalls.slice(-6).map(b => 
      `${b.overIndex}.${b.ballInOver}: ${b.commentary}`
    ).join('\n');
    const text = `🏏 *${match.title}* - Live Commentary\n${battingTeam.shortName}: ${selectedInning.totalRuns}/${selectedInning.wickets} (${selectedInning.oversCompleted}.${selectedInning.ballsInCurrentOver} ov)\n\n${lastBalls}\n\nLive on: fanclub.srijandev.in`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Ball-by-Ball Live Commentary
            </h3>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              {allBalls.length} Balls Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full ball trajectory description, extras, wickets, and milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Innings Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveInningIdx(0)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeInningIdx === 0 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1st Inn ({match.teamA.shortName})
            </button>
            <button
              onClick={() => setActiveInningIdx(1)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeInningIdx === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2nd Inn ({match.teamB.shortName})
            </button>
          </div>

          <button
            onClick={handleShareCommentary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Recent'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {(['all', 'wickets', 'fours', 'sixes', 'extras', 'dots'] as FilterType[]).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'all' ? 'All Balls' : filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search player or ball..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44"
          />
        </div>
      </div>

      {/* Balls Feed */}
      {displayBalls.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-slate-200/60">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No commentary records found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {allBalls.length === 0
              ? 'No balls have been bowled yet in this innings. Record balls from the Scoring tab to generate live commentary!'
              : 'No balls matched your current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayBalls.map((ball) => {
            const isWicket = ball.isWicket;
            const isSix = ball.runsOffBat === 6;
            const isFour = ball.runsOffBat === 4;
            const isExtra = ball.extraType !== 'none';

            let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
            let dotBg = 'bg-slate-200 text-slate-700';
            let ballLabel = ball.runsOffBat.toString();

            if (isWicket) {
              badgeBg = 'bg-rose-50 text-rose-800 border-rose-300';
              dotBg = 'bg-rose-500 text-white font-black';
              ballLabel = 'W';
            } else if (isSix) {
              badgeBg = 'bg-orange-50 text-orange-800 border-orange-300';
              dotBg = 'bg-orange-500 text-white font-black';
              ballLabel = '6';
            } else if (isFour) {
              badgeBg = 'bg-blue-50 text-blue-800 border-blue-300';
              dotBg = 'bg-blue-600 text-white font-black';
              ballLabel = '4';
            } else if (isExtra) {
              badgeBg = 'bg-amber-50 text-amber-800 border-amber-300';
              dotBg = 'bg-amber-500 text-slate-950 font-bold';
              ballLabel = ball.extraType === 'wide' ? 'Wd' : ball.extraType === 'no_ball' ? 'Nb' : 'Ex';
            }

            return (
              <div
                key={ball.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${badgeBg}`}
              >
                {/* Ball Dot */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${dotBg}`}>
                  {ballLabel}
                </div>

                {/* Over & Commentary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-mono font-bold text-slate-700">
                      Over {ball.overIndex}.{ball.ballInOver}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ball.bowlerName} to {ball.strikerName}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {ball.commentary}
                  </p>
                  {ball.wagonDirection && (
                    <div className="text-[10px] text-slate-500 mt-1 capitalize font-medium">
                      Direction: <strong>{ball.wagonDirection.replace(/_/g, ' ')}</strong>
                      {ball.isLofted && ' • Lofted shot'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
