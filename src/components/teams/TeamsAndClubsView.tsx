// ============================================================
// FAN CLUB — Clubs & Teams Registry Manager
// Local Cricket Clubs, Squad Rosters, and Official Teams
// ============================================================
import React, { useState, useEffect } from 'react';
import type { Club, Team, Player } from '../../types/cricket';
import { db } from '../../db/database';
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Trophy, 
  Plus, 
  Search, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Building,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TeamsAndClubsViewProps {
  onSelectTeam?: (team: Team) => void;
}

export const TeamsAndClubsView: React.FC<TeamsAndClubsViewProps> = ({ onSelectTeam }) => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'teams'>('clubs');
  const [clubs, setClubs] = useState<Club[]>(db.getClubs());
  const [teams, setTeams] = useState<Team[]>(db.getTeams());
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showNewClubModal, setShowNewClubModal] = useState(false);

  // Form state for new club
  const [newClubName, setNewClubName] = useState('');
  const [newClubShort, setNewClubShort] = useState('');
  const [newClubCity, setNewClubCity] = useState('');
  const [newClubGround, setNewClubGround] = useState('');
  const [newClubColor, setNewClubColor] = useState('#0055A5');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setClubs(db.getClubs());
      setTeams(db.getTeams());
    });
    return () => unsub();
  }, []);

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    const club: Club = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      shortName: newClubShort.trim() || newClubName.substring(0, 4).toUpperCase(),
      city: newClubCity.trim() || 'Mumbai',
      country: 'India',
      primaryColor: newClubColor,
      secondaryColor: '#FFFFFF',
      homeGround: newClubGround.trim() || 'Club Turf Ground',
      memberCount: 1,
      teamsCount: 1,
      trophiesCount: 0,
      status: 'active',
      description: 'Newly registered local cricket club on Fan Club platform.',
    };

    db.addClub(club);
    setNewClubName('');
    setNewClubShort('');
    setNewClubCity('');
    setNewClubGround('');
    setShowNewClubModal(false);
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
            <Building size={13} /> CLUBS & ROSTERS
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cricket Clubs & Teams</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Local academy clubs, grassroots squads, franchise teams, and player squad rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewClubModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" /> Register Local Club
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clubs'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Local Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'teams'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Match Teams ({teams.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs or teams..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* View: Clubs */}
      {activeTab === 'clubs' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              onClick={() => setSelectedClub(club)}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: club.primaryColor }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                    style={{ backgroundColor: club.primaryColor }}
                  >
                    {club.shortName}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {club.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {club.city}, {club.country}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {club.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Home Ground</div>
                  <div className="font-bold text-white text-[11px] truncate">{club.homeGround}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Members</div>
                  <div className="font-bold text-emerald-400">{club.memberCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Trophies</div>
                  <div className="font-bold text-amber-400">{club.trophiesCount}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Founded {club.foundedYear || 2020}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Squads <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Teams */}
      {activeTab === 'teams' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => {
                setSelectedTeam(team);
                if (onSelectTeam) onSelectTeam(team);
              }}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${team.color}, ${team.secondaryColor})`,
                }}
              />

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                  style={{ backgroundColor: team.color }}
                >
                  {team.shortName}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-base text-white truncate group-hover:text-emerald-400 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {team.players.length} Squad Players
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              {team.teamStats && (
                <div className="mt-4 grid grid-cols-4 gap-2 p-3 bg-slate-950 rounded-2xl text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Matches</div>
                    <div className="font-bold text-white">{team.teamStats.matches}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Won</div>
                    <div className="font-bold text-emerald-400">{team.teamStats.won}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Lost</div>
                    <div className="font-bold text-red-400">{team.teamStats.lost}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Win %</div>
                    <div className="font-bold text-white">{team.teamStats.winPercentage.toFixed(0)}%</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Club */}
      {showNewClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Register New Cricket Club</h3>
            <p className="text-xs text-slate-400 mb-4">Establish an official local club registry on Fan Club.</p>

            <form onSubmit={handleCreateClub} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Club Full Name</label>
                <input
                  type="text"
                  required
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="e.g. Shivaji Park Youngsters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Short Code</label>
                  <input
                    type="text"
                    value={newClubShort}
                    onChange={(e) => setNewClubShort(e.target.value)}
                    placeholder="e.g. SPY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newClubCity}
                    onChange={(e) => setNewClubCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Home Ground</label>
                <input
                  type="text"
                  value={newClubGround}
                  onChange={(e) => setNewClubGround(e.target.value)}
                  placeholder="e.g. Shivaji Park Ground #3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Club Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newClubColor}
                    onChange={(e) => setNewClubColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">{newClubColor}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClubModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
