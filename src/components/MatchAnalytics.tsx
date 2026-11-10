import React, { useState } from 'react';
import type { Match, PlanType, ThemeId } from '../types/cricket';
import { Award, TrendingUp, BarChart2, Users, Crown, Zap, Sparkles } from 'lucide-react';

interface MatchAnalyticsProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const MatchAnalytics: React.FC<MatchAnalyticsProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'mvp' | 'manhattan' | 'partnerships' | 'fow'>('mvp');

  // 1. Calculate CricHeroes MVP Points
  const calculatePlayerMvp = () => {
    const list: Array<{
      name: string;
      team: string;
      role: string;
      points: number;
      runs: number;
      wickets: number;
      catches: number;
      breakdown: string;
    }> = [];

    // Helper for team players
    const processTeam = (team: typeof match.teamA, inningIdx: 0 | 1, bowlingInningIdx: 0 | 1) => {
      const batInning = match.innings[inningIdx];
      const bowlInning = match.innings[bowlingInningIdx];

      team.players.forEach(p => {
        const bat = batInning.batsmen.find(b => b.playerId === p.id);
        const bowl = bowlInning.bowlers.find(b => b.playerId === p.id);

        let pts = 0;
        let runs = 0;
        let wkts = 0;
        const catches = p.catches || 0;

        if (bat) {
          runs = bat.runs;
          pts += bat.runs * 1; // 1 pt per run
          pts += bat.fours * 1; // +1 per four
          pts += bat.sixes * 2; // +2 per six
          if (bat.runs >= 50) pts += 20; // 50 bonus
          if (bat.runs >= 100) pts += 40; // 100 bonus
          if (bat.balls >= 10 && bat.strikeRate > 150) pts += 10;
        }

        if (bowl) {
          wkts = bowl.wickets;
          pts += bowl.wickets * 25; // 25 pts per wicket
          pts += bowl.maidens * 12; // 12 pts per maiden
          pts += bowl.dots * 1; // 1 pt per dot ball
          if (bowl.overs >= 2 && bowl.economy <= 6.0) pts += 15; // Economy bonus
          if (bowl.wickets >= 3) pts += 25; // 3-fer bonus
        }

        pts += catches * 8; // 8 pts per catch

        if (pts > 0) {
          list.push({
            name: p.name,
            team: team.shortName,
            role: p.role,
            points: Math.round(pts),
            runs,
            wickets: wkts,
            catches,
            breakdown: `${runs > 0 ? `${runs} runs` : ''}${runs > 0 && wkts > 0 ? ' • ' : ''}${wkts > 0 ? `${wkts} wkts` : ''}`
          });
        }
      });
    };

    processTeam(match.teamA, 0, 1);
    processTeam(match.teamB, 1, 0);

    return list.sort((a, b) => b.points - a.points);
  };

  const mvpRankings = calculatePlayerMvp();

  // Mock Manhattan Overs data for Innings 1 and 2
  const maxOvers = match.overs;
  const mockOverRuns1 = [8, 15, 6, 9, 14, 11, 7, 8, 12, 10, 9, 13, 11, 15, 8, 9, 14, 12, 11, 14];
  const mockOverRuns2 = [4, 18, 11, 8, 12, 15, 9, 6, 14, 8, 10, 11, 13, 9, 8, 12, 10, 7, 15];

  const isLocked = currentPlan === 'free';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              CricHeroes Match Analytics & Deep Insights
            </h3>
            {isLocked && (
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" /> Pro / VIP Feature
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Player MVP Rankings, Manhattan Charts, Worm Line, and Partnership breakdowns
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveAnalysisTab('mvp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeAnalysisTab === 'mvp' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>MVP Rankings</span>
          </button>
          <button
            onClick={() => setActiveAnalysisTab('manhattan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeAnalysisTab === 'manhattan' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Manhattan & Worm</span>
          </button>
          <button
            onClick={() => setActiveAnalysisTab('partnerships')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeAnalysisTab === 'partnerships' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Partnerships</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MVP POINTS RANKINGS */}
      {activeAnalysisTab === 'mvp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Top Match Impact Players (CricHeroes MVP Index)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Formula: Runs, 4s/6s bonus, Wickets (25pts), Maidens, Economy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* MVP #1 Highlight Hero Card */}
            {mvpRankings.length > 0 && (
              <div className="md:col-span-4 rounded-3xl p-5 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300">
                      ★ MATCH MVP #1
                    </span>
                    <span className="font-mono text-xs font-black">{mvpRankings[0].team}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-950 leading-tight">
                    {mvpRankings[0].name}
                  </h4>
                  <p className="text-xs font-bold text-slate-900/80 capitalize mt-0.5">
                    {mvpRankings[0].role}
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/10 backdrop-blur-xs text-xs font-bold">
                    {mvpRankings[0].breakdown || 'Match Winning Contribution'}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-950/20 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">MVP Score:</span>
                  <span className="text-3xl font-black text-slate-950">{mvpRankings[0].points} pts</span>
                </div>
              </div>
            )}

            {/* Top 5 Leaderboard List */}
            <div className="md:col-span-8 rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4">Rank</th>
                    <th className="py-2.5 px-4">Player</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-4">Match Stats</th>
                    <th className="py-2.5 px-4 text-right font-black">MVP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mvpRankings.slice(0, 7).map((p, idx) => (
                    <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-500">
                        <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.name}
                        <span className="text-[10px] text-slate-400 block font-normal capitalize">{p.role}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-600">{p.team}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.breakdown || '-'}</td>
                      <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">
                        {p.points} <span className="text-[10px] font-normal text-slate-500">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANHATTAN & WORM CHART */}
      {activeAnalysisTab === 'manhattan' && (
        <div className="space-y-6">
          {/* Manhattan Bar Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Manhattan Graph (Runs per Over Comparison)
              </span>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                  {match.teamA.shortName} (1st Inn)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  {match.teamB.shortName} (2nd Inn)
                </span>
              </div>
            </div>

            {/* SVG Manhattan Bars */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-x-auto">
              <div className="min-w-[600px] h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-300">
                {Array.from({ length: Math.min(20, maxOvers) }).map((_, i) => {
                  const runs1 = mockOverRuns1[i] || 0;
                  const runs2 = mockOverRuns2[i] || 0;
                  const height1 = (runs1 / 25) * 100;
                  const height2 = (runs2 / 25) * 100;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none transition-all z-20 whitespace-nowrap">
                        Over {i + 1}: {match.teamA.shortName} {runs1}r | {match.teamB.shortName} {runs2}r
                      </div>

                      {/* Bars */}
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div 
                          className="w-1/2 bg-blue-600 rounded-t-sm transition-all hover:brightness-110"
                          style={{ height: `${height1}%` }}
                          title={`${match.teamA.shortName} Over ${i + 1}: ${runs1} runs`}
                        />
                        <div 
                          className="w-1/2 bg-amber-500 rounded-t-sm transition-all hover:brightness-110"
                          style={{ height: `${height2}%` }}
                          title={`${match.teamB.shortName} Over ${i + 1}: ${runs2} runs`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                <span>Overs Timeline (1 to {maxOvers})</span>
                <span>Peak Over: 18 Runs</span>
              </div>
            </div>
          </div>

          {/* Worm Line Graph */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cumulative Worm Chart
              </span>
              <span className="text-[11px] text-slate-500">
                Score comparison line across full 20 overs
              </span>
            </div>

            <div className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
              <svg viewBox="0 0 600 160" className="w-full h-40">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="130" x2="580" y2="130" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="90" x2="580" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="40" y1="50" x2="580" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="40" y1="10" x2="580" y2="10" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

                <text x="10" y="133" fill="#64748B" fontSize="9">0</text>
                <text x="10" y="93" fill="#64748B" fontSize="9">60</text>
                <text x="10" y="53" fill="#64748B" fontSize="9">120</text>
                <text x="10" y="13" fill="#64748B" fontSize="9">180</text>

                {/* Team 1 Polyline (Blue) */}
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  points="40,130 67,125 94,115 121,110 148,102 175,90 202,82 229,78 256,71 283,61 310,54 337,47 364,37 391,28 418,22 445,18 472,13 499,9 526,6 553,3"
                />

                {/* Team 2 Polyline (Amber) */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  points="40,130 67,126 94,112 121,104 148,97 175,87 202,75 229,69 256,64 283,52 310,46 337,39 364,30 391,22 418,17 445,14 472,10 499,8 526,7"
                />

                {/* Legend in corner */}
                <circle cx="450" cy="145" r="4" fill="#3B82F6" />
                <text x="460" y="148" fill="#93C5FD" fontSize="10">{match.teamA.shortName} (176/7)</text>
                <circle cx="530" cy="145" r="4" fill="#F59E0B" />
                <text x="540" y="148" fill="#FDE68A" fontSize="10">{match.teamB.shortName} (161/8)</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERSHIPS */}
      {activeAnalysisTab === 'partnerships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Key Batting Partnerships ({match.teamA.name} 1st Innings)
            </span>
          </div>

          <div className="space-y-3">
            {match.innings[0].partnerships.map((p, idx) => {
              const p1Pct = p.totalRuns > 0 ? (p.batsman1Runs / p.totalRuns) * 100 : 50;
              const p2Pct = 100 - p1Pct;

              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-800">
                      {idx + 1}st Wicket Partnership: <strong className="text-blue-700 text-sm">{p.totalRuns} Runs</strong> ({p.totalBalls} balls)
                    </span>
                    <span className="text-slate-500 font-normal">
                      RR: {((p.totalRuns / p.totalBalls) * 6).toFixed(2)}
                    </span>
                  </div>

                  {/* Dual color stacked bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 mb-2">
                    <div className="bg-blue-600 h-full" style={{ width: `${p1Pct}%` }} />
                    <div className="bg-indigo-400 h-full" style={{ width: `${p2Pct}%` }} />
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-blue-900">
                      {p.batsman1Name}: <strong>{p.batsman1Runs} r</strong> ({Math.round(p1Pct)}%)
                    </span>
                    <span className="font-semibold text-indigo-900">
                      {p.batsman2Name}: <strong>{p.batsman2Runs} r</strong> ({Math.round(p2Pct)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
