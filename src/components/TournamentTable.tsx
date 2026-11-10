import React, { useState } from 'react';
import type { TournamentTeamStats, PlanType, ThemeId } from '../types/cricket';
import { TOURNAMENT_STANDINGS, LEADERBOARD_STATS } from '../data/mockData';
import { Plus, Trophy, Award, Flame, Zap, Shield, Sparkles } from 'lucide-react';

interface TournamentTableProps {
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const TournamentTable: React.FC<TournamentTableProps> = ({
  currentPlan,
  onOpenPlans,
}) => {
  const [standings, setStandings] = useState<TournamentTeamStats[]>(TOURNAMENT_STANDINGS);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#2563EB');

  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: TournamentTeamStats = {
      teamId: `team-${Date.now()}`,
      teamName: newTeamName.trim(),
      teamColor: newTeamColor,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      nr: 0,
      points: 0,
      nrr: 0.000,
      form: []
    };
    setStandings([...standings, newTeam]);
    setNewTeamName('');
    setShowAddTeamModal(false);
  };

  return (
    <div className="space-y-6">
      {/* CricHeroes Tournament Caps & Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orange Cap (Most Runs) */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" /> ORANGE CAP
            </span>
            <span className="text-xs font-mono font-bold">{LEADERBOARD_STATS.orangeCap.team}</span>
          </div>
          <h4 className="text-base font-black truncate">{LEADERBOARD_STATS.orangeCap.player}</h4>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black">{LEADERBOARD_STATS.orangeCap.runs} Runs</span>
            <span className="text-xs text-amber-100 font-semibold">SR: {LEADERBOARD_STATS.orangeCap.sr}</span>
          </div>
        </div>

        {/* Purple Cap (Most Wickets) */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-700 to-indigo-900 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> PURPLE CAP
            </span>
            <span className="text-xs font-mono font-bold">{LEADERBOARD_STATS.purpleCap.team}</span>
          </div>
          <h4 className="text-base font-black truncate">{LEADERBOARD_STATS.purpleCap.player}</h4>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black">{LEADERBOARD_STATS.purpleCap.wickets} Wkts</span>
            <span className="text-xs text-purple-200 font-semibold">Econ: {LEADERBOARD_STATS.purpleCap.econ}</span>
          </div>
        </div>

        {/* Most Sixes */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" /> MAXIMUM SIXES
            </span>
            <span className="text-xs font-mono font-bold">{LEADERBOARD_STATS.mostSixes.team}</span>
          </div>
          <h4 className="text-base font-black truncate">{LEADERBOARD_STATS.mostSixes.player}</h4>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black">{LEADERBOARD_STATS.mostSixes.count} Sixes</span>
            <span className="text-xs text-rose-200 font-semibold">Power Hitter</span>
          </div>
        </div>

        {/* Best Economy */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> BEST ECONOMY
            </span>
            <span className="text-xs font-mono font-bold">{LEADERBOARD_STATS.bestEconomy.team}</span>
          </div>
          <h4 className="text-base font-black truncate">{LEADERBOARD_STATS.bestEconomy.player}</h4>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black">{LEADERBOARD_STATS.bestEconomy.econ}</span>
            <span className="text-xs text-emerald-100 font-semibold">{LEADERBOARD_STATS.bestEconomy.overs} overs</span>
          </div>
        </div>
      </div>

      {/* Main Points Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Tournament Standings & Net Run Rate (NRR)
              </h3>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Official Leaderboard
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Auto-updating team points table with form guides and tiebreaker net run rates
            </p>
          </div>

          <button
            onClick={() => setShowAddTeamModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tournament Team</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center">T/NR</th>
                <th className="py-3 px-4 text-right font-black">Pts</th>
                <th className="py-3 px-4 text-right">NRR</th>
                <th className="py-3 px-4 text-center">Last 5 Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStandings.map((team, index) => {
                const isTopTwo = index < 2;
                return (
                  <tr 
                    key={team.teamId} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isTopTwo ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-black text-slate-500">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] ${
                        index === 0 
                          ? 'bg-amber-400 text-slate-950 font-black' 
                          : index === 1 
                          ? 'bg-slate-300 text-slate-900 font-bold' 
                          : 'text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: team.teamColor }} 
                      />
                      <span>{team.teamName}</span>
                      {isTopTwo && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Q
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">{team.played}</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-bold">{team.won}</td>
                    <td className="py-3 px-3 text-center text-rose-500 font-medium">{team.lost}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{team.tied + (team.nr || 0)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">{team.points}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      team.nrr >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(team.form || ['W', 'L']).map((res, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                              res === 'W' ? 'bg-emerald-600' : res === 'L' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Qualification Note */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-400 inline-block" />
            <span>Top 2 teams qualify directly for Championship Grand Final</span>
          </div>
          <div>
            NRR = (Total Runs Scored / Overs Faced) - (Total Runs Conceded / Overs Bowled)
          </div>
        </div>

        {/* Add Team Modal */}
        {showAddTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100">
              <h4 className="text-base font-bold text-slate-900 mb-3">Add Tournament Team</h4>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Challengers"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Team Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600 uppercase">{newTeamColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTeamModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTeam}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Add Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
