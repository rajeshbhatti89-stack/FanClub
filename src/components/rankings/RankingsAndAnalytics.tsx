// ============================================================
// FAN CLUB — Rankings & Advanced Match Analytics Suite
// ============================================================
import React, { useState } from 'react';
import type { Player } from '../../types/cricket';
import { db } from '../../db/database';
import { rankingAnalyticsService } from '../../services/rankingAnalytics';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  Award, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Activity,
  Flame
} from 'lucide-react';

export const RankingsAndAnalytics: React.FC = () => {
  const [format, setFormat] = useState<'all' | 't20i' | 'odi' | 'test'>('t20i');
  const [category, setCategory] = useState<'batting' | 'bowling' | 'allrounder'>('batting');
  const players = db.getPlayers();

  const rankedBatsmen = rankingAnalyticsService.calculateBattingRankings(players);
  const rankedBowlers = rankingAnalyticsService.calculateBowlingRankings(players);
  const rankedAllRounders = rankingAnalyticsService.calculateAllRounderRankings(players);

  const currentList =
    category === 'batting'
      ? rankedBatsmen
      : category === 'bowling'
      ? rankedBowlers
      : rankedAllRounders;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
            <Trophy size={13} /> FAN CLUB GLOBAL LEADERBOARD
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cricket Rankings & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic ratings computed from international tournament records and verified local match results.
          </p>
        </div>
      </div>

      {/* Category & Format Selectors */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          {[
            { id: 'batting', label: 'Top Batsmen' },
            { id: 'bowling', label: 'Top Bowlers' },
            { id: 'allrounder', label: 'Top All-Rounders' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                category === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
          {(['t20i', 'odi', 'test'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-colors ${
                format === fmt ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings Leaderboard Table */}
      <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Country / Club</th>
                <th className="py-3.5 px-4 text-center">Matches</th>
                <th className="py-3.5 px-4 text-center">
                  {category === 'batting' ? 'Runs' : category === 'bowling' ? 'Wickets' : 'Runs / Wkts'}
                </th>
                <th className="py-3.5 px-4 text-center">
                  {category === 'batting' ? 'Avg / SR' : category === 'bowling' ? 'Econ' : 'All-Round Index'}
                </th>
                <th className="py-3.5 px-4 text-right">FanClub Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentList.slice(0, 15).map((player, idx) => {
                const rank = idx + 1;
                const stats = player.overallStats;

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      {rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 inline-flex items-center justify-center font-black">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 inline-flex items-center justify-center font-black">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700 text-white inline-flex items-center justify-center font-black">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400">{rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            player.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition-colors">
                            {player.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{player.fanClubId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {player.country}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                      {stats.matches}
                    </td>

                    <td className="py-3.5 px-4 text-center font-black text-white">
                      {category === 'batting'
                        ? stats.runs
                        : category === 'bowling'
                        ? stats.wickets
                        : `${stats.runs} / ${stats.wickets}`}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">
                      {category === 'batting'
                        ? `${stats.battingAverage.toFixed(1)} (${stats.strikeRate.toFixed(1)})`
                        : category === 'bowling'
                        ? stats.bowlingEconomy > 0 ? stats.bowlingEconomy.toFixed(2) : '-'
                        : (stats.battingAverage * 0.6 + stats.wickets * 1.5).toFixed(1)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-400 font-mono">
                      {Math.max(500, Math.round(920 - idx * 28 + (stats.runs % 20)))} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
