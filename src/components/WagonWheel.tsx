import React, { useState } from 'react';
import type { Match, PlanType, ThemeId } from '../types/cricket';
import { Lock, Zap } from 'lucide-react';

interface WagonWheelProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

const DIRECTION_COORDS: Record<string, { x: number; y: number; label: string; isOffSide: boolean }> = {
  third_man: { x: 90, y: 100, label: 'Third Man', isOffSide: true },
  point: { x: 50, y: 200, label: 'Point', isOffSide: true },
  cover: { x: 90, y: 300, label: 'Extra Cover', isOffSide: true },
  long_off: { x: 150, y: 360, label: 'Long Off', isOffSide: true },
  straight: { x: 200, y: 370, label: 'Straight', isOffSide: false },
  long_on: { x: 250, y: 360, label: 'Long On', isOffSide: false },
  mid_wicket: { x: 310, y: 300, label: 'Mid Wicket', isOffSide: false },
  square_leg: { x: 350, y: 200, label: 'Square Leg', isOffSide: false },
  fine_leg: { x: 310, y: 100, label: 'Fine Leg', isOffSide: false },
};

export const WagonWheel: React.FC<WagonWheelProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'boundaries' | 'sixes' | 'fours'>('all');
  const [selectedBatsmanId, setSelectedBatsmanId] = useState<string>('all');

  const currentInning = match.innings[match.currentInningIndex];
  const battingTeam = match.currentInningIndex === 0 ? match.teamA : match.teamB;

  let filteredBalls = currentInning.balls.filter(b => b.runsOffBat > 0 && b.wagonDirection);

  if (selectedBatsmanId !== 'all') {
    filteredBalls = filteredBalls.filter(b => b.strikerId === selectedBatsmanId);
  }

  if (selectedFilter === 'sixes') {
    filteredBalls = filteredBalls.filter(b => b.runsOffBat === 6);
  } else if (selectedFilter === 'fours') {
    filteredBalls = filteredBalls.filter(b => b.runsOffBat === 4);
  } else if (selectedFilter === 'boundaries') {
    filteredBalls = filteredBalls.filter(b => b.runsOffBat === 4 || b.runsOffBat === 6);
  }

  let offSideRuns = 0;
  let legSideRuns = 0;
  filteredBalls.forEach(b => {
    const dir = DIRECTION_COORDS[b.wagonDirection || 'straight'];
    if (dir?.isOffSide) {
      offSideRuns += b.runsOffBat;
    } else {
      legSideRuns += b.runsOffBat;
    }
  });

  const totalRunsFiltered = offSideRuns + legSideRuns;
  const offSidePct = totalRunsFiltered > 0 ? Math.round((offSideRuns / totalRunsFiltered) * 100) : 50;
  const legSidePct = 100 - offSidePct;

  const isLocked = currentPlan === 'free';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 relative overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Interactive 360° Wagon Wheel
            </h3>
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                <Lock className="w-3 h-3" /> Pro Feature (₹21)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Shot direction distribution on pitch for {battingTeam.name}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Batsman Selector */}
          <select
            value={selectedBatsmanId}
            onChange={(e) => setSelectedBatsmanId(e.target.value)}
            disabled={isLocked}
            className="p-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="all">All Batsmen</option>
            {currentInning.batsmen.map(b => (
              <option key={b.playerId} value={b.playerId}>{b.name}</option>
            ))}
          </select>

          {/* Shot Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'boundaries', 'fours', 'sixes'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                disabled={isLocked}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedFilter === f
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ground View & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Cricket Ground Pitch */}
        <div className="md:col-span-8 flex justify-center relative">
          <div className="w-full max-w-[420px] aspect-square relative rounded-full p-2 bg-gradient-to-b from-emerald-500 to-green-700 shadow-inner border-4 border-emerald-600/40">
            {/* 30 yard circle */}
            <div className="absolute inset-10 rounded-full border border-dashed border-white/50 pointer-events-none" />

            {/* Pitch in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-20 bg-amber-100/90 rounded-sm shadow-md border border-amber-300 pointer-events-none z-10 flex flex-col justify-between py-1 items-center">
              <div className="w-5 h-0.5 bg-slate-800" />
              <div className="text-[7px] font-black text-amber-900 uppercase tracking-tighter">PITCH</div>
              <div className="w-5 h-0.5 bg-slate-800" />
            </div>

            {/* SVG Lines for Shots */}
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="200" cy="200" r="130" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />

              {filteredBalls.map((ball, i) => {
                const targetCoord = DIRECTION_COORDS[ball.wagonDirection || 'straight'];
                if (!targetCoord) return null;

                const strokeColor = ball.runsOffBat === 6 
                  ? '#C084FC'
                  : ball.runsOffBat === 4 
                  ? '#34D399'
                  : '#60A5FA';

                return (
                  <g key={`${ball.id}-${i}`}>
                    <line
                      x1="200"
                      y1="200"
                      x2={targetCoord.x}
                      y2={targetCoord.y}
                      stroke={strokeColor}
                      strokeWidth={ball.runsOffBat >= 4 ? 3 : 1.5}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={targetCoord.x}
                      cy={targetCoord.y}
                      r={ball.runsOffBat === 6 ? 6 : ball.runsOffBat === 4 ? 4.5 : 3}
                      fill={strokeColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Ground Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/90 uppercase tracking-wider">
              Straight / Sight Screen
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/90 uppercase tracking-wider">
              Keeper / Fine Leg
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/90 uppercase tracking-wider -rotate-90">
              Off Side
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/90 uppercase tracking-wider rotate-90">
              Leg Side
            </span>
          </div>

          {/* Locked Overlay for Free Plan */}
          {isLocked && (
            <div className="absolute inset-0 rounded-3xl bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mb-3 shadow-lg">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <h4 className="text-lg font-bold">Wagon Wheel Locked on Free Plan</h4>
              <p className="text-xs text-slate-300 max-w-xs mt-1 mb-4">
                Upgrade to FanClub Pro for just ₹21/month to analyze shot directions, off-side vs leg-side splits, and boundary trends.
              </p>
              <button
                onClick={onOpenPlans}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:brightness-105 transition-all cursor-pointer"
              >
                Upgrade to Pro (₹21/Month)
              </button>
            </div>
          )}
        </div>

        {/* Breakdown Stats */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Zone Distribution
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Off Side</span>
                  <span className="text-blue-600">{offSidePct}% ({offSideRuns} runs)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${offSidePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Leg Side</span>
                  <span className="text-emerald-600">{legSidePct}% ({legSideRuns} runs)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${legSidePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Shot Legend */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block mb-1">Color Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-600">Sixes (MAXIMUM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Fours (BOUNDARIES)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Singles, Doubles & Threes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
