import React, { useState } from 'react';
import type { Team, Player, PlayerRole, BattingStyle, BowlingStyle } from '../types/cricket';
import { DEFAULT_TEAMS } from '../data/mockData';
import { Users, Plus, Shield, Award, UserCheck, Star } from 'lucide-react';

interface TeamsManagerProps {
  onSelectTeamColor?: (teamColor: string) => void;
}

export const TeamsManager: React.FC<TeamsManagerProps> = () => {
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Add Player Form State
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('batsman');
  const [newBatStyle, setNewBatStyle] = useState<BattingStyle>('RHB');
  const [newBowlStyle, setNewBowlStyle] = useState<BowlingStyle>('Right-arm Medium');

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      battingStyle: newBatStyle,
      bowlingStyle: newBowlStyle,
      matches: 0,
      innings: 0,
      runs: 0,
      highestScore: 0,
      fifties: 0,
      hundreds: 0,
      strikeRate: 0,
      battingAverage: 0,
      wickets: 0,
      bowlingEconomy: 0,
      bestBowling: '0/0',
      catches: 0,
      runOuts: 0
    };

    setTeams(prev => prev.map(t => {
      if (t.id === selectedTeamId) {
        return {
          ...t,
          players: [...t.players, newPlayer]
        };
      }
      return t;
    }));

    setNewPlayerName('');
    setShowAddPlayerModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 space-y-6">
      {/* Top Bar with Team Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">CricHeroes Teams & Player Profiles</h3>
          </div>
          <p className="text-xs text-slate-500">
            Official squad rosters, player batting/bowling statistics & career averages
          </p>
        </div>

        {/* Team Badges */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {teams.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTeamId === t.id
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-100 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.shortName}</span>
            </button>
          ))}

          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Player</span>
          </button>
        </div>
      </div>

      {/* Squad Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeTeam.players.map(player => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  {player.role}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {player.battingStyle || 'RHB'}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                {player.name}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {player.bowlingStyle || 'Specialist Batsman'}
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Matches</span>
                <span className="text-xs font-black text-slate-800">{player.matches}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Runs</span>
                <span className="text-xs font-black text-blue-700">{player.runs}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Wickets</span>
                <span className="text-xs font-black text-emerald-700">{player.wickets}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED PLAYER PROFILE MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedPlayer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {selectedPlayer.name}
                  </h4>
                  <span className="text-xs text-slate-500 capitalize">
                    {selectedPlayer.role} • {selectedPlayer.battingStyle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Career Batting Stats */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Career Batting Record
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Innings</span>
                  <span className="font-black text-slate-900">{selectedPlayer.innings}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Total Runs</span>
                  <span className="font-black text-blue-700">{selectedPlayer.runs}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Highest</span>
                  <span className="font-black text-slate-900">{selectedPlayer.highestScore}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Strike Rate</span>
                  <span className="font-black text-slate-900">{selectedPlayer.strikeRate.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Average</span>
                  <span className="font-black text-slate-900">{selectedPlayer.battingAverage.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">50s / 100s</span>
                  <span className="font-black text-slate-900">{selectedPlayer.fifties} / {selectedPlayer.hundreds}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Catches</span>
                  <span className="font-black text-slate-900">{selectedPlayer.catches || 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Run Outs</span>
                  <span className="font-black text-slate-900">{selectedPlayer.runOuts || 0}</span>
                </div>
              </div>
            </div>

            {/* Career Bowling Stats */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Career Bowling Record
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Wickets</span>
                  <span className="font-black text-emerald-700 text-sm">{selectedPlayer.wickets}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Economy</span>
                  <span className="font-black text-slate-900 text-sm">{selectedPlayer.bowlingEconomy.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Best Bowling</span>
                  <span className="font-black text-slate-900 text-sm">{selectedPlayer.bestBowling}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ADD PLAYER MODAL */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h4 className="text-base font-bold text-slate-900 mb-3">Add Squad Player ({activeTeam.name})</h4>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Player Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jasprit Bumrah"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Role</label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="allrounder">All-Rounder</option>
                  <option value="wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batting Style</label>
                <select
                  value={newBatStyle}
                  onChange={(e) => setNewBatStyle(e.target.value as BattingStyle)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="RHB">Right Handed (RHB)</option>
                  <option value="LHB">Left Handed (LHB)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bowling Style</label>
                <select
                  value={newBowlStyle}
                  onChange={(e) => setNewBowlStyle(e.target.value as BowlingStyle)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Right-arm Fast">Right-arm Fast</option>
                  <option value="Right-arm Medium">Right-arm Medium</option>
                  <option value="Right-arm Spin">Right-arm Spin</option>
                  <option value="Left-arm Fast">Left-arm Fast</option>
                  <option value="Left-arm Spin">Left-arm Spin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayer}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Add to Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
