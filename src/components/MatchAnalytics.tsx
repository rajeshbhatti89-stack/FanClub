import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lock, Trophy, BarChart2, TrendingUp, Users, Activity, Crown, ChevronRight } from 'lucide-react';
import type { Match, BallRecord, BatsmanInning, Partnership, Inning } from '../types/cricket';
import type { PlanType } from '../types/cricket';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MatchAnalyticsProps {
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

// ─── Internal Types ───────────────────────────────────────────────────────────

interface MVPEntry {
  rank: number;
  playerId: string;
  playerName: string;
  teamName: string;
  teamColor: string;
  performanceString: string;
  points: number;
}

interface OverData {
  over: number;
  inn1Runs: number;
  inn2Runs: number;
}

interface WormPoint {
  ball: number;
  inn1Cum: number;
  inn2Cum: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeMVP(match: Match): MVPEntry[] {
  const entries: MVPEntry[] = [];

  match.innings.forEach((inning) => {
    const teamName = inning.teamName;
    const teamColor = inning.teamColor;

    // Batting impact
    inning.batsmen.forEach((b) => {
      if (b.didNotBat) return;
      const sr = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;
      let pts = b.runs * 1.0 + b.fours * 0.5 + b.sixes * 1.0;
      if (sr > 150) pts += 10;
      else if (sr > 120) pts += 5;
      if (b.runs >= 50) pts += 15;
      if (b.runs >= 100) pts += 25;

      const existing = entries.find((e) => e.playerId === b.playerId);
      const perfStr = `${b.runs}(${b.balls}) ${b.fours}×4 ${b.sixes}×6`;
      if (existing) {
        existing.points += pts;
        existing.performanceString += ` | Bat: ${perfStr}`;
      } else {
        entries.push({
          rank: 0,
          playerId: b.playerId,
          playerName: b.name,
          teamName,
          teamColor,
          performanceString: `Bat: ${perfStr}`,
          points: Math.round(pts),
        });
      }
    });

    // Bowling impact (from opposing inning's bowlers perspective, stored in this inning)
    inning.bowlers.forEach((bwl) => {
      let pts = bwl.wickets * 20 + bwl.maidens * 5 + bwl.dots * 0.5;
      const econ = bwl.economy;
      if (econ < 6) pts += 15;
      else if (econ < 8) pts += 8;
      if (bwl.wickets >= 3) pts += 15;
      if (bwl.wickets >= 5) pts += 25;

      // Bowler's team is the OPPONENT of batting team
      const bowlerTeam = match.innings[0].teamId === inning.teamId ? match.teamB : match.teamA;
      const bowlerTeamColor = bowlerTeam.color;

      const totalOvers = bwl.overs + bwl.balls / 10;
      const perfStr = `${bwl.wickets}/${bwl.runsConceded} (${totalOvers.toFixed(1)})`;

      const existing = entries.find((e) => e.playerId === bwl.playerId);
      if (existing) {
        existing.points += Math.round(pts);
        existing.performanceString += ` | Bowl: ${perfStr}`;
      } else {
        entries.push({
          rank: 0,
          playerId: bwl.playerId,
          playerName: bwl.name,
          teamName: bowlerTeam.name,
          teamColor: bowlerTeamColor,
          performanceString: `Bowl: ${perfStr}`,
          points: Math.round(pts),
        });
      }
    });
  });

  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}

function computeOverByOver(balls1: BallRecord[], balls2: BallRecord[], maxOvers: number): OverData[] {
  const data: OverData[] = [];
  for (let o = 0; o < maxOvers; o++) {
    const inn1 = balls1.filter((b) => b.overIndex === o).reduce((s, b) => s + b.runsOffBat + b.extraRuns, 0);
    const inn2 = balls2.filter((b) => b.overIndex === o).reduce((s, b) => s + b.runsOffBat + b.extraRuns, 0);
    if (o < Math.max(
      balls1.length > 0 ? (Math.max(...balls1.map(b => b.overIndex)) + 1) : 0,
      balls2.length > 0 ? (Math.max(...balls2.map(b => b.overIndex)) + 1) : 0,
      1
    )) {
      data.push({ over: o + 1, inn1Runs: inn1, inn2Runs: inn2 });
    }
  }
  return data;
}

function computeWorm(balls1: BallRecord[], balls2: BallRecord[]): WormPoint[] {
  const maxBalls = Math.max(balls1.length, balls2.length);
  const points: WormPoint[] = [{ ball: 0, inn1Cum: 0, inn2Cum: 0 }];
  let cum1 = 0, cum2 = 0;
  for (let i = 0; i < maxBalls; i++) {
    if (i < balls1.length) cum1 += (balls1[i].runsOffBat + balls1[i].extraRuns);
    if (i < balls2.length) cum2 += (balls2[i].runsOffBat + balls2[i].extraRuns);
    points.push({ ball: i + 1, inn1Cum: cum1, inn2Cum: cum2 });
  }
  return points;
}

function computeWinProbability(match: Match): { chasing: number; defending: number; label: string } {
  if (match.innings.length < 2 || match.status === 'completed') {
    if (match.winnerTeamId) {
      const chaserWon = match.innings[1]?.teamId === match.winnerTeamId;
      return { chasing: chaserWon ? 100 : 0, defending: chaserWon ? 0 : 100, label: 'Result' };
    }
    return { chasing: 50, defending: 50, label: 'No data' };
  }

  const inn2 = match.innings[1];
  if (!inn2.targetScore || inn2.balls.length === 0) {
    return { chasing: 50, defending: 50, label: 'Awaiting 2nd innings' };
  }

  const target = inn2.targetScore;
  const runs = inn2.totalRuns;
  const wickets = inn2.wickets;
  const ballsBowled = inn2.balls.filter(b => b.isLegalBall).length;
  const totalBalls = match.overs * 6;
  const ballsRemaining = totalBalls - ballsBowled;
  const runsNeeded = target - runs;
  const wicketsInHand = 10 - wickets;

  if (runsNeeded <= 0) return { chasing: 100, defending: 0, label: 'Chasing team won' };
  if (ballsRemaining <= 0 || wicketsInHand <= 0) return { chasing: 0, defending: 100, label: 'Defending team won' };

  const rrr = (runsNeeded / ballsRemaining) * 6;
  const crr = ballsBowled > 0 ? (runs / ballsBowled) * 6 : 0;
  const wicketFactor = (wicketsInHand / 10);
  const rrFactor = crr > 0 ? Math.min(crr / rrr, 2) : 0.5;
  const rawChasing = (rrFactor * wicketFactor * 60);
  const chasingPct = Math.min(Math.max(Math.round(rawChasing), 5), 95);

  return {
    chasing: chasingPct,
    defending: 100 - chasingPct,
    label: `Need ${runsNeeded} off ${ballsRemaining} balls, ${wicketsInHand} wkts`,
  };
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

type TabKey = 'mvp' | 'manhattan' | 'worm' | 'partnerships' | 'winprob';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode; plan: PlanType | 'free' }[] = [
  { key: 'mvp', label: 'MVP', icon: <Trophy size={14} />, plan: 'free' },
  { key: 'manhattan', label: 'Manhattan', icon: <BarChart2 size={14} />, plan: 'pro' },
  { key: 'worm', label: 'Worm', icon: <TrendingUp size={14} />, plan: 'pro' },
  { key: 'partnerships', label: 'Partnerships', icon: <Users size={14} />, plan: 'free' },
  { key: 'winprob', label: 'Win %', icon: <Activity size={14} />, plan: 'premium' },
];

function isPlanSufficient(current: PlanType, required: PlanType | 'free'): boolean {
  if (required === 'free') return true;
  if (required === 'pro') return current === 'pro' || current === 'premium';
  if (required === 'premium') return current === 'premium';
  return false;
}

// ─── Locked Overlay ───────────────────────────────────────────────────────────

function LockedOverlay({ requiredPlan, onOpenPlans }: { requiredPlan: PlanType; onOpenPlans: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/60 rounded-2xl" />
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Lock size={24} className="text-white" />
        </div>
        <p className="text-gray-900 font-bold text-lg">
          {requiredPlan === 'premium' ? 'Premium' : 'Pro'} Feature
        </p>
        <p className="text-gray-500 text-sm max-w-xs">
          Upgrade to{' '}
          <span className="font-semibold capitalize text-orange-500">{requiredPlan}</span>{' '}
          to unlock this chart.
        </p>
        <button
          onClick={onOpenPlans}
          className="mt-1 flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow hover:shadow-md transition-all hover:scale-105"
        >
          Upgrade Now <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── MVP Points Index ─────────────────────────────────────────────────────────

function MVPIndex({ entries }: { entries: MVPEntry[] }) {
  const maxPoints = entries[0]?.points ?? 1;

  const rankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow';
    return 'bg-gray-100 text-gray-500';
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <Trophy size={40} className="opacity-30" />
        <p className="text-sm">No data yet. Start scoring to see MVP rankings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.playerId}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          {/* Rank Badge */}
          <div
            className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${rankStyle(e.rank)}`}
          >
            {e.rank === 1 ? <Crown size={14} /> : e.rank}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm truncate">{e.playerName}</span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: e.teamColor }}
              >
                {e.teamName.substring(0, 3).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">{e.performanceString}</p>
            {/* Points Bar */}
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(e.points / maxPoints) * 100}%`,
                  backgroundColor:
                    e.rank === 1 ? '#f59e0b' : e.rank === 2 ? '#94a3b8' : e.rank === 3 ? '#b45309' : '#6366f1',
                }}
              />
            </div>
          </div>

          {/* Points */}
          <div className="flex-shrink-0 text-right">
            <span
              className="text-base font-bold"
              style={{
                color: e.rank === 1 ? '#d97706' : e.rank === 2 ? '#64748b' : e.rank === 3 ? '#92400e' : '#4f46e5',
              }}
            >
              {e.points}
            </span>
            <p className="text-xs text-gray-400">pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Manhattan Chart ──────────────────────────────────────────────────────────

function ManhattanChart({
  overData,
  color1,
  color2,
  team1Name,
  team2Name,
}: {
  overData: OverData[];
  color1: string;
  color2: string;
  team1Name: string;
  team2Name: string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 560, H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxRuns = Math.max(...overData.flatMap((d) => [d.inn1Runs, d.inn2Runs]), 1);
  const yMax = Math.ceil(maxRuns / 5) * 5 + 5;

  const barGroupW = overData.length > 0 ? chartW / overData.length : 0;
  const barW = barGroupW * 0.35;
  const gap = barGroupW * 0.05;

  const yScale = (runs: number) => chartH - (runs / yMax) * chartH;

  const yTicks = [0, Math.round(yMax / 4), Math.round(yMax / 2), Math.round((yMax * 3) / 4), yMax];

  if (overData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <BarChart2 size={40} className="opacity-30" />
        <p className="text-sm">No ball data available yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color1 }} />
          {team1Name}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color2 }} />
          {team2Name}
        </div>
      </div>

      {/* SVG */}
      <div className="bg-gray-50 rounded-2xl p-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: Math.max(overData.length * 24, 300) }}
          onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
        >
          {/* Y-axis grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + yScale(tick)}
                y2={PAD.top + yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 4}
                y={PAD.top + yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#9ca3af"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Bars */}
          {overData.map((d, i) => {
            const groupX = PAD.left + i * barGroupW + barGroupW * 0.1;
            const y1 = PAD.top + yScale(d.inn1Runs);
            const h1 = chartH - yScale(d.inn1Runs);
            const y2 = PAD.top + yScale(d.inn2Runs);
            const h2 = chartH - yScale(d.inn2Runs);
            return (
              <g key={d.over}>
                {/* Inn1 bar */}
                {h1 > 0 && (
                  <rect
                    x={groupX}
                    y={y1}
                    width={barW}
                    height={h1}
                    fill={color1}
                    rx={2}
                    opacity={0.85}
                    className="cursor-pointer hover:opacity-100"
                    onMouseEnter={(ev) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const rect = svg.getBoundingClientRect();
                      const scale = rect.width / W;
                      setTooltip({
                        visible: true,
                        x: (groupX + barW / 2) * scale,
                        y: y1 * scale,
                        content: `Over ${d.over} · ${team1Name}: ${d.inn1Runs} runs`,
                      });
                    }}
                  />
                )}
                {/* Inn2 bar */}
                {h2 > 0 && (
                  <rect
                    x={groupX + barW + gap}
                    y={y2}
                    width={barW}
                    height={h2}
                    fill={color2}
                    rx={2}
                    opacity={0.85}
                    className="cursor-pointer hover:opacity-100"
                    onMouseEnter={(ev) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const rect = svg.getBoundingClientRect();
                      const scale = rect.width / W;
                      setTooltip({
                        visible: true,
                        x: (groupX + barW + gap + barW / 2) * scale,
                        y: y2 * scale,
                        content: `Over ${d.over} · ${team2Name}: ${d.inn2Runs} runs`,
                      });
                    }}
                  />
                )}
                {/* X label */}
                <text
                  x={groupX + barW + gap / 2}
                  y={PAD.top + chartH + 14}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#9ca3af"
                >
                  {d.over}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={PAD.left}
            x2={PAD.left}
            y1={PAD.top}
            y2={PAD.top + chartH}
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + chartH}
            y2={PAD.top + chartH}
            stroke="#d1d5db"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 36, transform: 'translateX(-50%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ─── Worm Chart ───────────────────────────────────────────────────────────────

function WormChart({
  wormData,
  color1,
  color2,
  team1Name,
  team2Name,
}: {
  wormData: WormPoint[];
  color1: string;
  color2: string;
  team1Name: string;
  team2Name: string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 560, H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 42 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxBall = wormData[wormData.length - 1]?.ball ?? 1;
  const maxRuns = Math.max(...wormData.flatMap((d) => [d.inn1Cum, d.inn2Cum]), 1);
  const yMax = Math.ceil(maxRuns / 20) * 20 + 10;

  const xScale = (ball: number) => (ball / Math.max(maxBall, 1)) * chartW;
  const yScale = (runs: number) => chartH - (runs / yMax) * chartH;

  const buildPath = (key: 'inn1Cum' | 'inn2Cum') =>
    wormData
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${PAD.left + xScale(d.ball)},${PAD.top + yScale(d[key])}`)
      .join(' ');

  const yTicks = [0, Math.round(yMax / 4), Math.round(yMax / 2), Math.round((yMax * 3) / 4), yMax];

  if (wormData.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <TrendingUp size={40} className="opacity-30" />
        <p className="text-sm">No ball data available yet.</p>
      </div>
    );
  }

  const handleMouseMove = (ev: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = W / rect.width;
    const svgX = (ev.clientX - rect.left) * scale;
    const chartX = svgX - PAD.left;
    if (chartX < 0 || chartX > chartW) return;
    const ball = Math.round((chartX / chartW) * maxBall);
    const nearest = wormData.reduce((prev, cur) =>
      Math.abs(cur.ball - ball) < Math.abs(prev.ball - ball) ? cur : prev
    );
    setTooltip({
      visible: true,
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top - 10,
      content: `Ball ${nearest.ball} · ${team1Name}: ${nearest.inn1Cum} | ${team2Name}: ${nearest.inn2Cum}`,
    });
  };

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-1.5 rounded" style={{ backgroundColor: color1 }} />
          {team1Name}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-1.5 rounded" style={{ backgroundColor: color2 }} />
          {team2Name}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 300 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
        >
          {/* Grid */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + yScale(tick)}
                y2={PAD.top + yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 5}
                y={PAD.top + yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#9ca3af"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Lines */}
          <path d={buildPath('inn1Cum')} fill="none" stroke={color1} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={buildPath('inn2Cum')} fill="none" stroke={color2} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray="5,3" />

          {/* Dots — sample every 6 balls (over boundary) */}
          {wormData
            .filter((d) => d.ball % 6 === 0 || d.ball === wormData[wormData.length - 1].ball)
            .map((d) => (
              <g key={d.ball}>
                <circle
                  cx={PAD.left + xScale(d.ball)}
                  cy={PAD.top + yScale(d.inn1Cum)}
                  r={3}
                  fill={color1}
                  stroke="white"
                  strokeWidth={1.5}
                />
                {d.inn2Cum > 0 && (
                  <circle
                    cx={PAD.left + xScale(d.ball)}
                    cy={PAD.top + yScale(d.inn2Cum)}
                    r={3}
                    fill={color2}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            ))}

          {/* X axis label */}
          {[0, Math.round(maxBall / 4), Math.round(maxBall / 2), Math.round((maxBall * 3) / 4), maxBall].map((b) => (
            <text
              key={b}
              x={PAD.left + xScale(b)}
              y={PAD.top + chartH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
            >
              {b}
            </text>
          ))}

          {/* Axes */}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + chartH} stroke="#d1d5db" strokeWidth={1} />
          <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH} y2={PAD.top + chartH} stroke="#d1d5db" strokeWidth={1} />
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 pointer-events-none shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 36, transform: 'translateX(-50%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ─── Partnerships Chart ───────────────────────────────────────────────────────

function PartnershipsChart({ match }: { match: Match }) {
  const allPartnerships: Array<Partnership & { teamColor: string; teamName: string }> = match.innings.flatMap(
    (inning) =>
      inning.partnerships.map((p) => ({
        ...p,
        teamColor: inning.teamColor,
        teamName: inning.teamName,
      }))
  );

  if (allPartnerships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <Users size={40} className="opacity-30" />
        <p className="text-sm">No partnership data yet.</p>
      </div>
    );
  }

  const maxRuns = Math.max(...allPartnerships.map((p) => p.totalRuns), 1);

  return (
    <div className="space-y-1">
      {/* Innings headers */}
      {match.innings.map((inning, idx) => {
        const partnerships = inning.partnerships;
        if (partnerships.length === 0) return null;
        return (
          <div key={inning.teamId} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inning.teamColor }} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {inning.teamName} — Innings {idx + 1}
              </span>
            </div>
            {partnerships.map((p) => (
              <div key={p.wicketIndex} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                {/* Batsmen */}
                <div className="w-44 flex-shrink-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {p.batsman1Name} & {p.batsman2Name}
                  </p>
                  <p className="text-xs text-gray-400">{p.totalBalls} balls</p>
                </div>
                {/* Bar */}
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center pl-2 transition-all duration-700"
                    style={{
                      width: `${Math.max((p.totalRuns / maxRuns) * 100, 4)}%`,
                      backgroundColor: inning.teamColor,
                      opacity: 0.85,
                    }}
                  >
                    {p.totalRuns > maxRuns * 0.15 && (
                      <span className="text-white text-xs font-bold">{p.totalRuns}</span>
                    )}
                  </div>
                </div>
                {/* Runs label */}
                <div className="w-10 text-right flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800">{p.totalRuns}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Win Probability Gauge ────────────────────────────────────────────────────

function WinProbGauge({ match }: { match: Match }) {
  const { chasing, defending, label } = useMemo(() => computeWinProbability(match), [match]);

  const inn1 = match.innings[0];
  const inn2 = match.innings[1];
  const chaserName = inn2?.teamName ?? 'Chasing';
  const defenderName = inn1?.teamName ?? 'Defending';
  const chaserColor = inn2?.teamColor ?? '#22c55e';
  const defenderColor = inn1?.teamColor ?? '#ef4444';

  // SVG arc gauge
  const R = 80;
  const CX = 120, CY = 100;
  const startAngle = Math.PI; // left
  const endAngle = 0;        // right
  const totalArc = Math.PI;

  const arcPath = (from: number, to: number, r: number) => {
    const sx = CX + r * Math.cos(from);
    const sy = CY - r * Math.sin(from);
    const ex = CX + r * Math.cos(to);
    const ey = CY - r * Math.sin(to);
    const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey}`;
  };

  const chasingAngle = startAngle - (chasing / 100) * totalArc;

  // Needle angle
  const needleAngle = startAngle - (chasing / 100) * totalArc;
  const needleLen = R - 10;
  const needleX = CX + needleLen * Math.cos(needleAngle);
  const needleY = CY - needleLen * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center w-full">
        <svg viewBox="0 0 240 120" className="w-full max-w-xs">
          {/* Background arc — defender */}
          <path
            d={arcPath(Math.PI, 0, R)}
            fill="none"
            stroke={defenderColor}
            strokeWidth={18}
            strokeLinecap="round"
            opacity={0.25}
          />
          {/* Background arc — chaser */}
          <path
            d={arcPath(Math.PI, 0, R)}
            fill="none"
            stroke={chaserColor}
            strokeWidth={18}
            strokeLinecap="round"
            opacity={0.25}
          />

          {/* Filled arc — defender portion (right side) */}
          <path
            d={arcPath(chasingAngle, 0, R)}
            fill="none"
            stroke={defenderColor}
            strokeWidth={18}
            strokeLinecap="butt"
            opacity={0.85}
          />
          {/* Filled arc — chaser portion (left side) */}
          <path
            d={arcPath(Math.PI, chasingAngle, R)}
            fill="none"
            stroke={chaserColor}
            strokeWidth={18}
            strokeLinecap="butt"
            opacity={0.85}
          />

          {/* Needle */}
          <line
            x1={CX}
            y1={CY}
            x2={needleX}
            y2={needleY}
            stroke="#1f2937"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={5} fill="#1f2937" />

          {/* Labels */}
          <text x={CX - R - 2} y={CY + 18} textAnchor="middle" fontSize={9} fill="#6b7280">
            {defenderName.substring(0, 8)}
          </text>
          <text x={CX + R + 2} y={CY + 18} textAnchor="middle" fontSize={9} fill="#6b7280">
            {chaserName.substring(0, 8)}
          </text>
        </svg>

        {/* Percentage display */}
        <div className="flex items-center gap-6 mt-2">
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: defenderColor }}>
              {defending}%
            </p>
            <p className="text-xs text-gray-500">{defenderName}</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: chaserColor }}>
              {chasing}%
            </p>
            <p className="text-xs text-gray-500">{chaserName}</p>
          </div>
        </div>

        {/* Context label */}
        <p className="text-xs text-gray-400 mt-3 text-center">{label}</p>
      </div>

      {/* Full-width split bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${defending}%`, backgroundColor: defenderColor }}
        />
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${chasing}%`, backgroundColor: chaserColor }}
        />
      </div>

      <div className="flex justify-between w-full text-xs text-gray-500 px-1">
        <span style={{ color: defenderColor }} className="font-semibold">
          {defenderName} {defending}%
        </span>
        <span style={{ color: chaserColor }} className="font-semibold">
          {chasing}% {chaserName}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchAnalytics({ match, currentPlan, onOpenPlans }: MatchAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('mvp');

  const inn1 = match.innings[0];
  const inn2 = match.innings[1];

  // Computed data (memoized)
  const mvpEntries = useMemo(() => computeMVP(match), [match]);

  const overData = useMemo(
    () => computeOverByOver(inn1.balls, inn2.balls, match.overs),
    [inn1.balls, inn2.balls, match.overs]
  );

  const wormData = useMemo(() => computeWorm(inn1.balls, inn2.balls), [inn1.balls, inn2.balls]);

  const color1 = match.teamA.color;
  const color2 = match.teamB.color;

  const planForTab: Record<TabKey, PlanType | 'free'> = {
    mvp: 'free',
    manhattan: 'pro',
    worm: 'pro',
    partnerships: 'free',
    winprob: 'premium',
  };

  const isLocked = !isPlanSufficient(currentPlan, planForTab[activeTab] as PlanType | 'free');

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Match Analytics</h2>
            <p className="text-xs text-gray-400">Advanced insights & charts</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
          {TAB_CONFIG.map((tab) => {
            const locked = !isPlanSufficient(currentPlan, tab.plan as PlanType | 'free');
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {locked && (
                  <Lock size={10} className="text-amber-500 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <div className="relative min-h-48">
          {/* Actual content (possibly blurred behind overlay) */}
          <div className={isLocked ? 'blur-sm pointer-events-none select-none' : ''}>
            {activeTab === 'mvp' && <MVPIndex entries={mvpEntries} />}
            {activeTab === 'manhattan' && (
              <ManhattanChart
                overData={overData}
                color1={color1}
                color2={color2}
                team1Name={match.teamA.name}
                team2Name={match.teamB.name}
              />
            )}
            {activeTab === 'worm' && (
              <WormChart
                wormData={wormData}
                color1={color1}
                color2={color2}
                team1Name={match.teamA.name}
                team2Name={match.teamB.name}
              />
            )}
            {activeTab === 'partnerships' && <PartnershipsChart match={match} />}
            {activeTab === 'winprob' && <WinProbGauge match={match} />}
          </div>

          {/* Locked overlay */}
          {isLocked && (
            <LockedOverlay
              requiredPlan={planForTab[activeTab] as PlanType}
              onOpenPlans={onOpenPlans}
            />
          )}
        </div>
      </div>

      {/* Plan badges footer */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        {(['free', 'pro', 'premium'] as const).map((plan) => (
          <span
            key={plan}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              plan === 'free'
                ? 'bg-green-50 text-green-700'
                : plan === 'pro'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {plan === 'free' ? '✓ Free' : plan === 'pro' ? '⭐ Pro' : '👑 Premium'}
            {currentPlan === plan && ' (you)'}
          </span>
        ))}
      </div>
    </div>
  );
}
