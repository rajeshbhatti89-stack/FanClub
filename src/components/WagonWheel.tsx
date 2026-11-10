import React, { useState } from 'react';
import type { Match, PlanType } from '../types/cricket';
import { Target, Filter, Flame, Zap, Award } from 'lucide-react';

interface WagonWheelProps {
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

const ZONE_ANGLES: Record<string, { label: string; angle: number }> = {
  cover: { label: 'Cover', angle: 45 },
  mid_off: { label: 'Mid-Off', angle: 75 },
  straight: { label: 'Long-Off / Straight', angle: 90 },
  mid_on: { label: 'Long-On / Mid-On', angle: 105 },
  mid_wicket: { label: 'Mid-Wicket', angle: 135 },
  square_leg: { label: 'Square Leg', angle: 165 },
  fine_leg: { label: 'Fine Leg', angle: 215 },
  third_man: { label: 'Third Man', angle: 315 },
  point: { label: 'Point', angle: 345 },
};

export const WagonWheel: React.FC<WagonWheelProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [selectedInningIdx, setSelectedInningIdx] = useState<0 | 1>(match.currentInningIndex);
  const [selectedBatsmanId, setSelectedBatsmanId] = useState<string>('all');
  const [shotFilter, setShotFilter] = useState<'all' | 'boundaries' | 'sixes' | 'dots'>('all');

  const selectedInning = match.innings[selectedInningIdx];
  const battingTeam = selectedInningIdx === 0 ? match.teamA : match.teamB;

  // Collect all balls with wagonDirection
  const shotsWithDirection = (selectedInning.balls || []).filter(b => !!b.wagonDirection);

  // Apply filters
  const filteredShots = shotsWithDirection.filter(b => {
    if (selectedBatsmanId !== 'all' && b.strikerId !== selectedBatsmanId) return false;
    if (shotFilter === 'boundaries' && b.runsOffBat !== 4 && b.runsOffBat !== 6) return false;
    if (shotFilter === 'sixes' && b.runsOffBat !== 6) return false;
    if (shotFilter === 'dots' && b.runsOffBat !== 0) return false;
    return true;
  });

  // Calculate zone summary
  const zoneSummary: Record<string, { shots: number; runs: number }> = {};
  Object.keys(ZONE_ANGLES).forEach(k => {
    zoneSummary[k] = { shots: 0, runs: 0 };
  });

  shotsWithDirection.forEach(b => {
    const dir = b.wagonDirection || 'cover';
    if (zoneSummary[dir]) {
      zoneSummary[dir].shots += 1;
      zoneSummary[dir].runs += b.runsOffBat;
    }
  });

  // Center coordinate of SVG
  const cx = 200;
  const cy = 200;
  const radius = 170;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Interactive Wagon Wheel & Field Zones
            </h3>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {filteredShots.length} Shots Mapped
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full 360° ground visualizer for scoring shots, lofted drives, and boundaries
          </p>
        </div>

        {/* Inning Switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedInningIdx(0)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedInningIdx === 0 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1st Inn ({match.teamA.shortName})
          </button>
          <button
            onClick={() => setSelectedInningIdx(1)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedInningIdx === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2nd Inn ({match.teamB.shortName})
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Batsman filter */}
          <select
            value={selectedBatsmanId}
            onChange={(e) => setSelectedBatsmanId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="all">All Batsmen ({battingTeam.shortName})</option>
            {selectedInning.batsmen.map(b => (
              <option key={b.playerId} value={b.playerId}>
                {b.name} ({b.runs}r, {b.balls}b)
              </option>
            ))}
          </select>

          {/* Shot filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['all', 'boundaries', 'sixes', 'dots'] as const).map(type => (
              <button
                key={type}
                onClick={() => setShotFilter(type)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  shotFilter === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Dot
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 1-3 Runs
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> 4 Runs
          </span>
          <span className="flex items-center gap-1 text-orange-600">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> 6 Runs
          </span>
        </div>
      </div>

      {/* Main Wheel + Zone Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Cricket Ground */}
        <div className="md:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[380px] aspect-square">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
              {/* Outer Boundary grass */}
              <circle cx={cx} cy={cy} r={radius} fill="#15803d" stroke="#166534" strokeWidth="6" />
              {/* 30-yard circle */}
              <circle cx={cx} cy={cy} r={radius * 0.55} fill="#16a34a" stroke="#ffffff" strokeDasharray="4,4" strokeWidth="1.5" opacity="0.6" />
              {/* Pitch rectangle */}
              <rect x={cx - 10} y={cy - 28} width="20" height="56" rx="2" fill="#d97706" opacity="0.85" />
              {/* Crease lines */}
              <line x1={cx - 10} y1={cy - 20} x2={cx + 10} y2={cy - 20} stroke="#ffffff" strokeWidth="1.5" />
              <line x1={cx - 10} y1={cy + 20} x2={cx + 10} y2={cy + 20} stroke="#ffffff" strokeWidth="1.5" />

              {/* Zone Rays & Labels */}
              {Object.entries(ZONE_ANGLES).map(([key, zone]) => {
                const rad = (zone.angle - 90) * (Math.PI / 180);
                const x2 = cx + (radius - 18) * Math.cos(rad);
                const y2 = cy + (radius - 18) * Math.sin(rad);
                return (
                  <g key={key}>
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="0.8" opacity="0.2" />
                    <text
                      x={x2}
                      y={y2}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      opacity="0.85"
                    >
                      {zone.label.split('/')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Shot Vectors */}
              {filteredShots.map((shot, idx) => {
                const dir = shot.wagonDirection || 'cover';
                const angleDeg = ZONE_ANGLES[dir]?.angle || 45;
                // Add slight jitter for realistic visual spread
                const jitter = (idx % 7 - 3) * 3;
                const rad = (angleDeg + jitter - 90) * (Math.PI / 180);

                const shotDist = shot.runsOffBat === 6 ? radius - 8 : shot.runsOffBat === 4 ? radius - 15 : radius * 0.5 + (shot.runsOffBat * 15);
                const sx = cx + shotDist * Math.cos(rad);
                const sy = cy + shotDist * Math.sin(rad);

                let strokeColor = '#94a3b8';
                let strokeWidth = 1.5;
                if (shot.runsOffBat === 6) {
                  strokeColor = '#f97316';
                  strokeWidth = 3;
                } else if (shot.runsOffBat === 4) {
                  strokeColor = '#3b82f6';
                  strokeWidth = 2.5;
                } else if (shot.runsOffBat > 0) {
                  strokeColor = '#22c55e';
                  strokeWidth = 2;
                }

                return (
                  <g key={shot.id || idx}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={sx}
                      y2={sy}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    <circle cx={sx} cy={sy} r={shot.runsOffBat === 6 ? 4 : 3} fill={strokeColor} stroke="#ffffff" strokeWidth="1" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Zone Breakdown Table */}
        <div className="md:col-span-5 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Directional Scoring Breakdown
          </h4>
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {Object.entries(ZONE_ANGLES).map(([key, zone]) => {
              const data = zoneSummary[key] || { shots: 0, runs: 0 };
              const totalRunsInInning = selectedInning.totalRuns || 1;
              const pct = Math.round((data.runs / totalRunsInInning) * 100);

              return (
                <div
                  key={key}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="font-bold text-slate-800">{zone.label}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">{data.shots} shots</span>
                    <span className="font-black text-slate-900 w-12 text-right">
                      {data.runs} runs
                    </span>
                    <span className="w-8 text-right font-mono text-[10px] text-emerald-600 font-bold">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
