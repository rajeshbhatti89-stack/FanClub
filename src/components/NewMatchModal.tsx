import React, { useState } from 'react';
import type { Match, Team } from '../types/cricket';
import { DEFAULT_TEAMS } from '../data/mockData';
import { X, Trophy, Shield } from 'lucide-react';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (match: Match) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  onCreateMatch,
}) => {
  const [title, setTitle] = useState('Championship Clash');
  const [venue, setVenue] = useState('City Cricket Stadium');
  const [overs, setOvers] = useState(20);
  const [teamAName, setTeamAName] = useState('India Champions');
  const [teamAShort, setTeamAShort] = useState('IND');
  const [teamAColor, setTeamAColor] = useState('#0055A5');

  const [teamBName, setTeamBName] = useState('Aussie Gladiators');
  const [teamBShort, setTeamBShort] = useState('AUS');
  const [teamBColor, setTeamBColor] = useState('#D4AF37');

  const [tossWinner, setTossWinner] = useState<'A' | 'B'>('A');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const teamA: Team = {
      id: `team-${Date.now()}-A`,
      name: teamAName.trim() || 'Team A',
      shortName: teamAShort.trim() || 'TMA',
      color: teamAColor,
      players: DEFAULT_TEAMS[0].players.map(p => ({ ...p, id: `p-a-${p.id}` })),
    };

    const teamB: Team = {
      id: `team-${Date.now()}-B`,
      name: teamBName.trim() || 'Team B',
      shortName: teamBShort.trim() || 'TMB',
      color: teamBColor,
      players: DEFAULT_TEAMS[1].players.map(p => ({ ...p, id: `p-b-${p.id}` })),
    };

    const totalOvers = Number(overs) || 20;

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      title,
      venue,
      date: 'Today, Just Started',
      overs: totalOvers,
      maxOversPerBowler: Math.ceil(totalOvers / 5),
      ballType: 'leather_white',
      matchType: totalOvers <= 20 ? 'T20' : 'ODI',
      teamA,
      teamB,
      tossWinnerId: tossWinner === 'A' ? teamA.id : teamB.id,
      tossDecision,
      currentInningIndex: 0,
      selectedTheme: 'wcFinal',
      status: 'live',
      info: {
        matchNumber: 'Match 1',
        series: title,
        umpires: ['Official Umpire 1', 'Official Umpire 2'],
        scorer: 'FanClub Scorer',
        tossWinner: tossWinner === 'A' ? teamA.name : teamB.name,
        tossDecision,
        pitchCondition: 'Balanced Grass Turf'
      },
      innings: [
        {
          teamId: teamA.id,
          teamName: teamA.name,
          teamColor: teamA.color,
          totalRuns: 0,
          wickets: 0,
          oversCompleted: 0,
          ballsInCurrentOver: 0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
          currentStrikerId: teamA.players[0].id,
          currentNonStrikerId: teamA.players[1].id,
          currentBowlerId: teamB.players[teamB.players.length - 1].id,
          fallOfWickets: [],
          partnerships: [],
          batsmen: [
            { playerId: teamA.players[0].id, name: teamA.players[0].name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
            { playerId: teamA.players[1].id, name: teamA.players[1].name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
          ],
          bowlers: [
            { 
              playerId: teamB.players[teamB.players.length - 1].id, 
              name: teamB.players[teamB.players.length - 1].name, 
              overs: 0, 
              maidens: 0, 
              runsConceded: 0, 
              wickets: 0, 
              economy: 0, 
              wides: 0, 
              noBalls: 0, 
              dots: 0,
              foursConceded: 0,
              sixesConceded: 0
            }
          ],
          balls: []
        },
        {
          teamId: teamB.id,
          teamName: teamB.name,
          teamColor: teamB.color,
          totalRuns: 0,
          wickets: 0,
          oversCompleted: 0,
          ballsInCurrentOver: 0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
          currentStrikerId: teamB.players[0].id,
          currentNonStrikerId: teamB.players[1].id,
          currentBowlerId: teamA.players[teamA.players.length - 1].id,
          fallOfWickets: [],
          partnerships: [],
          batsmen: [],
          bowlers: [],
          balls: []
        }
      ]
    };

    onCreateMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg">Create New Cricket Match</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Match Title / Tournament</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ICC World Championship"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Venue / Ground</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Narendra Modi Stadium"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Total Overs per Side</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 50].map((ov) => (
                <button
                  key={ov}
                  type="button"
                  onClick={() => setOvers(ov)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    overs === ov
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ov} Ov
                </button>
              ))}
            </div>
          </div>

          {/* Teams Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Team A */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Team 1 (Batting First)
              </span>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Team Name</label>
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Short Code</label>
                  <input
                    type="text"
                    value={teamAShort}
                    onChange={(e) => setTeamAShort(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold uppercase"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Color</label>
                  <input
                    type="color"
                    value={teamAColor}
                    onChange={(e) => setTeamAColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Team B */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Team 2 (Bowling First)
              </span>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Team Name</label>
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Short Code</label>
                  <input
                    type="text"
                    value={teamBShort}
                    onChange={(e) => setTeamBShort(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold uppercase"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Color</label>
                  <input
                    type="color"
                    value={teamBColor}
                    onChange={(e) => setTeamBColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toss */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">Toss Details</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={tossWinner}
                onChange={(e) => setTossWinner(e.target.value as 'A' | 'B')}
                className="p-2 rounded-lg border border-slate-300 font-bold bg-white cursor-pointer"
              >
                <option value="A">{teamAName} Won Toss</option>
                <option value="B">{teamBName} Won Toss</option>
              </select>
              <select
                value={tossDecision}
                onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
                className="p-2 rounded-lg border border-slate-300 font-bold bg-white cursor-pointer"
              >
                <option value="bat">Elected to Bat</option>
                <option value="bowl">Elected to Bowl</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Start Live Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
