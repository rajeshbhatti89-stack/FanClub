// ============================================================
// FAN CLUB — Master Worldwide Player Discovery & Database View
// ============================================================
import React, { useState, useEffect } from 'react';
import type { Player, PlayerRole } from '../../types/cricket';
import { db } from '../../db/database';
import { exportService } from '../../services/exportService';
import { PlayerProfileModal } from './PlayerProfileModal';
import { PlayerComparisonModal } from './PlayerComparisonModal';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  QrCode, 
  ChevronRight, 
  Globe2, 
  Sparkles,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

interface PlayerDatabaseViewProps {
  onNavigateToGrassroots?: () => void;
  onNavigateToClaim?: () => void;
}

export const PlayerDatabaseView: React.FC<PlayerDatabaseViewProps> = ({
  onNavigateToGrassroots,
  onNavigateToClaim,
}) => {
  const [players, setPlayers] = useState<Player[]>(db.getPlayers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Player[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPlayers(db.getPlayers());
    });
    return () => unsub();
  }, []);

  // Filter players
  const filtered = players.filter((p) => {
    const q = search.trim().toLowerCase();
    const isCricHeroesQuery = q.includes('cricheroes') || q.includes('crick hero') || q.includes('crichero') || q === 'ch';

    const matchesSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      p.fanClubId.toLowerCase().includes(q) ||
      (p.cricheroesId && p.cricheroesId.toLowerCase().includes(q)) ||
      (isCricHeroesQuery && (!!p.cricheroesId || p.dataProvenance?.source === 'cricHeroes')) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.currentTeam && p.currentTeam.toLowerCase().includes(q)) ||
      (p.teams && p.teams.some((t) => t.toLowerCase().includes(q)));

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesCountry = countryFilter === 'all' || p.country === countryFilter;
    
    let matchesCategory = true;
    if (categoryFilter === 'international') matchesCategory = !!p.isInternational;
    else if (categoryFilter === 'domestic') matchesCategory = !!p.isDomestic;
    else if (categoryFilter === 'local') matchesCategory = !!p.isLocalClub;
    else if (categoryFilter === 'cricHeroes') matchesCategory = p.dataProvenance?.source === 'cricHeroes' || !!p.cricheroesId;
    else if (categoryFilter === 'village_district') matchesCategory = p.grassrootsCategory === 'village_district';
    else if (categoryFilter === 'corporate') matchesCategory = p.grassrootsCategory === 'corporate';
    else if (categoryFilter === 'school_college') matchesCategory = p.grassrootsCategory === 'school_college';
    else if (categoryFilter === 'tennis_ball') matchesCategory = p.grassrootsCategory === 'tennis_ball';
    else if (categoryFilter === 'womens_cricket') matchesCategory = p.grassrootsCategory === 'womens_cricket';
    else if (categoryFilter === 'city_club') matchesCategory = p.grassrootsCategory === 'city_club';
    else if (categoryFilter === 'unverified') matchesCategory = !p.isVerified && p.verificationStatus !== 'verified';
    else if (categoryFilter === 'verified') matchesCategory = !!p.isVerified || p.verificationStatus === 'verified';

    return matchesSearch && matchesRole && matchesCountry && matchesCategory;
  });

  const handleToggleCompare = (p: Player) => {
    if (compareList.some((c) => c.id === p.id)) {
      setCompareList((prev) => prev.filter((c) => c.id !== p.id));
    } else {
      if (compareList.length >= 2) {
        setCompareList([compareList[1], p]);
      } else {
        setCompareList((prev) => [...prev, p]);
      }
    }
  };

  const handleLaunchCompare = () => {
    if (compareList.length === 2) {
      setShowComparisonModal(true);
    } else {
      alert('Please select exactly 2 players to compare.');
    }
  };

  const countries = Array.from(new Set(players.map((p) => p.country))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
            <Globe2 size={13} /> WORLDWIDE REGISTRY
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Global Cricket Players</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse international legends, domestic tournament players, and migrated CricHeroes local talents.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToGrassroots && (
            <button
              onClick={onNavigateToGrassroots}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus size={14} />
              <span>+ Grassroots Onboarding</span>
            </button>
          )}

          {onNavigateToClaim && (
            <button
              onClick={onNavigateToClaim}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <QrCode size={14} />
              <span>Claim Profile</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              if (isCompareMode) setCompareList([]);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isCompareMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            <span>{isCompareMode ? 'Exit Compare' : 'Compare Players'}</span>
          </button>

          <button
            onClick={() => exportService.exportPlayersToCsv(players)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Compare Drawer */}
      {isCompareMode && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase">Selected for Comparison:</span>
            {compareList.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Select 2 players below</span>
            ) : (
              compareList.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1"
                >
                  {p.name}
                </span>
              ))
            )}
          </div>

          <button
            onClick={handleLaunchCompare}
            disabled={compareList.length !== 2}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all disabled:opacity-40"
          >
            Launch Comparison ({compareList.length}/2)
          </button>
        </div>
      )}

      {/* Quick Filter Category Pills */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: `All Players (${players.length})` },
          { id: 'cricHeroes', label: `🏏 CricHeroes Players (${players.filter(p => p.dataProvenance?.source === 'cricHeroes' || !!p.cricheroesId).length})`, highlight: true },
          { id: 'local', label: `🌾 Grassroots & Local (${players.filter(p => p.isLocalClub).length})` },
          { id: 'international', label: `🌍 International Legends (${players.filter(p => p.isInternational).length})` },
          { id: 'unverified', label: `⚡ Claimable Profiles (${players.filter(p => !p.isVerified).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
              categoryFilter === tab.id
                ? tab.highlight
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                  : 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                : tab.highlight
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, CricHeroes ID, city, team..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="all">All Playing Roles</option>
          <option value="batsman">Batsmen</option>
          <option value="bowler">Bowlers</option>
          <option value="allrounder">All-Rounders</option>
          <option value="wicketkeeper">Wicketkeepers</option>
        </select>

        {/* Country Filter */}
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="all">All Countries ({countries.length})</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="all">All Categories</option>
          <option value="unverified">⚡ Unverified Grassroots (Claimable)</option>
          <option value="verified">🛡️ Verified Digital Passports</option>
          <option value="village_district">🌾 Village & District Teams</option>
          <option value="corporate">🏢 Corporate Tournaments</option>
          <option value="school_college">🎓 School & College Youth</option>
          <option value="tennis_ball">🎾 Tennis-Ball & Box Cricket</option>
          <option value="womens_cricket">👑 Women's Cricket</option>
          <option value="city_club">🏛️ City & State Clubs</option>
          <option value="cricHeroes">🏏 CricHeroes Migrated</option>
          <option value="international">🌍 International Tier</option>
          <option value="domestic">🏆 Domestic & Franchise</option>
        </select>
      </div>

      {/* Players Counter */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <span>
          Showing <strong className="text-white">{filtered.length}</strong> of {players.length} registered players
        </span>
      </div>

      {/* Players Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((player) => {
          const stats = player.overallStats;
          const isSelected = compareList.some((c) => c.id === player.id);

          return (
            <div
              key={player.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/20 bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  onClick={() => setSelectedPlayer(player)}
                  className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-black text-emerald-400 flex-shrink-0 cursor-pointer shadow-md"
                >
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    player.name.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      onClick={() => setSelectedPlayer(player)}
                      className="font-extrabold text-base text-white truncate cursor-pointer hover:text-emerald-400 transition-colors"
                    >
                      {player.name}
                    </h3>
                    {(player.isVerified || player.verificationStatus === 'verified') ? (
                      <span title="Verified Cricket Passport">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      </span>
                    ) : (
                      <span title="Unverified Grassroots Profile" className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-400 capitalize mt-0.5">
                    {player.role} • {player.city || player.country}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                      {player.fanClubId}
                    </span>

                    {(player.isVerified || player.verificationStatus === 'verified') ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                        Verified
                      </span>
                    ) : player.verificationStatus === 'claimed' ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                        Claimed
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300">
                        Unverified
                      </span>
                    )}

                    {player.grassrootsCategory && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
                        {player.grassrootsCategory.replace(/_/g, ' ')}
                      </span>
                    )}

                    {player.dataProvenance?.source === 'cricHeroes' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300">
                        CricHeroes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row (Real numbers preserved, zero fake data) */}
              <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Matches</div>
                  <div className="text-xs font-black text-white">{player.matches ?? stats.matches ?? 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Runs</div>
                  <div className="text-xs font-black text-emerald-400">
                    {player.runs !== undefined ? player.runs : stats.runs > 0 ? stats.runs : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Wickets</div>
                  <div className="text-xs font-black text-cyan-400">
                    {player.wickets !== undefined ? player.wickets : stats.wickets > 0 ? stats.wickets : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg / SR</div>
                  <div className="text-xs font-black text-white">
                    {stats.battingAverage > 0 ? stats.battingAverage.toFixed(1) : '-'}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  View Full Profile <ChevronRight size={13} />
                </button>

                {isCompareMode ? (
                  <button
                    onClick={() => handleToggleCompare(player)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Selected' : '+ Compare'}
                  </button>
                ) : !player.isVerified && player.verificationStatus !== 'verified' && onNavigateToClaim ? (
                  <button
                    onClick={onNavigateToClaim}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all"
                  >
                    Claim Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400"
                    title="View Digital Passport"
                  >
                    <QrCode size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onCompareWith={(p) => {
            setSelectedPlayer(null);
            setIsCompareMode(true);
            setCompareList([p]);
          }}
        />
      )}

      {/* Head-to-Head Comparison Modal */}
      {showComparisonModal && compareList.length === 2 && (
        <PlayerComparisonModal
          playerA={compareList[0]}
          playerB={compareList[1]}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
};
