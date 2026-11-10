import React, { useState } from 'react';
import type { TournamentTeamStats, PlanType, ThemeId } from '../types/cricket';
import { TOURNAMENT_STANDINGS } from '../data/mockData';
import { Plus, Trophy } from 'lucide-react';

interface TournamentTableProps {
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const TournamentTable: React.FC<TournamentTableProps> = () => {
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
      points: 0,
      nrr: 0.000,
    };
    setStandings([...standings, newTeam]);
    setNewTeamName('');
    setShowAddTeamModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tournament Leaderboard & Points Table
            </h3>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              NRR Auto-Calc
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Official league qualification matrix with Net Run Rate tiebreakers
          </p>
        </div>

        <button
          onClick={() => setShowAddTeamModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add League Team</span>
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
              <th className="py-3 px-3 text-center">T</th>
              <th className="py-3 px-4 text-right font-black">Pts</th>
              <th className="py-3 px-4 text-right">NRR</th>
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
                  <td className="py-3 px-3 text-center text-slate-400 font-medium">{team.tied}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">{team.points}</td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${
                    team.nrr >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Qualification note */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-400 inline-block" />
          <span>Top 2 teams qualify directly for World Championship Final</span>
        </div>
        <div>
          NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
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
  );
};
