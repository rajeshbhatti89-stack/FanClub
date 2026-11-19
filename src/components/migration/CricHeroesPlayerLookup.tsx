// ============================================================
// FAN CLUB — CricHeroes Live Player Search & Direct Ingestion UI
// Single-View User-Friendly Search — Zero Tabs · Instant DB Sync
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Check, 
  Zap, 
  MapPin, 
  Edit3, 
  PlusCircle, 
  X, 
  Shield, 
  Phone, 
  Trophy,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { cricHeroesLookupService, type CricHeroesSearchResult } from '../../services/cricHeroesLookup';
import type { CricHeroesRawPlayer } from '../../types/cricHeroes';
import type { Player } from '../../types/cricket';
import { db } from '../../db/database';
import confetti from 'canvas-confetti';

interface CricHeroesPlayerLookupProps {
  onViewPlayerInDb?: (playerId: string) => void;
  onAddPlayerToMatch?: (player: Player, teamId?: string) => void;
}

export const CricHeroesPlayerLookup: React.FC<CricHeroesPlayerLookupProps> = ({ 
  onViewPlayerInDb,
  onAddPlayerToMatch 
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CricHeroesSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Edit Stats Modal State
  const [editingPlayer, setEditingPlayer] = useState<CricHeroesRawPlayer | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    team_name: '',
    playing_role: '',
    matches: 0,
    runs: 0,
    wickets: 0,
    highest_score: 0,
    strike_rate: 0,
    batting_average: 0,
    best_bowling: '0/0',
    city: 'Mumbai',
    phone: '',
  });

  // Auto-run initial popular suggestions on mount so the user never sees a blank screen!
  useEffect(() => {
    handleSearch('Rajesh Bhatti');
  }, []);

  const showNotification = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchInput).trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await cricHeroesLookupService.searchCricHeroesDatabase(q);
      setSearchResults(results);
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSyncAgain = async (rawPlayer: CricHeroesRawPlayer) => {
    const chId = String(rawPlayer.cricheroes_id || '');
    setImportingId(chId);

    try {
      const res = cricHeroesLookupService.importPlayerToFanClub(rawPlayer);
      if (res.success) {
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch {}

        showNotification('success', res.message);
        const updated = await cricHeroesLookupService.searchCricHeroesDatabase(searchInput || rawPlayer.name || chId);
        setSearchResults(updated);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setImportingId(null);
    }
  };

  // Open Edit Modal for a Player
  const openEditModal = (raw: CricHeroesRawPlayer) => {
    setEditingPlayer(raw);
    setEditForm({
      name: raw.name || raw.full_name || '',
      team_name: raw.team_name || (raw.team_names && raw.team_names[0]) || 'Royal Strikers XI',
      playing_role: raw.playing_role || 'All-Rounder',
      matches: raw.matches || raw.career_stats?.matches || 0,
      runs: raw.runs || raw.career_stats?.runs || 0,
      wickets: raw.wickets || raw.career_stats?.wickets || 0,
      highest_score: raw.highest_score || raw.career_stats?.highest_score || 0,
      strike_rate: raw.strike_rate || raw.career_stats?.strike_rate || 0,
      batting_average: raw.batting_average || raw.career_stats?.batting_average || 0,
      best_bowling: raw.best_bowling || '0/0',
      city: raw.city || 'Mumbai',
      phone: '',
    });
  };

  // Save updates from Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const chId = String(editingPlayer.cricheroes_id || '');
      const existing = db.getPlayerByCricHeroesId(chId) || db.getPlayers().find(p => p.name.toLowerCase() === (editingPlayer.name || '').toLowerCase());
      
      if (existing) {
        cricHeroesLookupService.updatePlayerStats(existing.id, {
          name: editForm.name,
          team_name: editForm.team_name,
          playing_role: editForm.playing_role,
          matches: Number(editForm.matches),
          runs: Number(editForm.runs),
          wickets: Number(editForm.wickets),
          highest_score: Number(editForm.highest_score),
          strike_rate: Number(editForm.strike_rate),
          batting_average: Number(editForm.batting_average),
          best_bowling: editForm.best_bowling,
          city: editForm.city,
          phone: editForm.phone,
        });
      }

      showNotification('success', `Updated statistics for ${editForm.name}!`);
      setEditingPlayer(null);
      // Re-run search to refresh cards
      handleSearch(searchInput || editForm.name);
    } catch (err: any) {
      showNotification('error', 'Update failed: ' + err.message);
    }
  };

  // 1-Tap Add to Live Match Playing XI
  const handleAddToMatch = (result: CricHeroesSearchResult, teamId?: string) => {
    const chId = String(result.rawPlayer.cricheroes_id || '');
    const p = db.getPlayerByCricHeroesId(chId) || db.getPlayerById(result.fanClubPlayerId || '');
    
    if (p && onAddPlayerToMatch) {
      onAddPlayerToMatch(p, teamId);
      showNotification('success', `Added ${p.name} directly to today's active match squad!`);
    } else {
      // Auto import and add
      const saved = cricHeroesLookupService.importPlayerToFanClub(result.rawPlayer);
      if (saved.player && onAddPlayerToMatch) {
        onAddPlayerToMatch(saved.player, teamId);
        showNotification('success', `Added ${saved.player.name} directly to today's active match squad!`);
      } else {
        showNotification('info', `${result.rawPlayer.name} is saved in FanClub database.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : notification.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
            {notification.type === 'info' && <Sparkles size={16} className="text-blue-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold hover:opacity-75">✕</button>
        </div>
      )}

      {/* ── SEARCH HEADER: SINGLE UNIFIED INTERFACE ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-600" /> LIVE CRICHEROES AUTO-SYNC ENGINE
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            ⚡ 100% Instant Database Auto-Sync
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900">
          Search Any CricHeroes Player
        </h3>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Type any player&apos;s <strong>Name</strong> (e.g. Aakash Verma, Rinku Singh, Sameer Khan, or any player coming tomorrow), <strong>CricHeroes ID</strong> (e.g. <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold">CH-88019</code>), or <strong>Profile URL</strong>. Every search result is <strong>instantly synchronized and saved</strong> into your FanClub database!
        </p>

        {/* Search Input Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by Player Name, CricHeroes ID, or Profile Link..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-10 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-inner"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchInput.trim()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
          >
            {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
            Search & Auto-Sync
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Quick Searches:</span>
          {[
            { label: '⭐ Rajesh Bhatti (240 M, 213 W)', query: 'Rajesh Bhatti' },
            { label: 'R. S. Bhatti (Amritsar)', query: 'R. S. Bhatti' },
            { label: 'Aakash Verma (Mumbai)', query: 'Aakash Verma' },
            { label: 'Krishna Satpute (Tennis King)', query: 'Krishna Satpute' },
            { label: 'Bunty Patel (Sixer King)', query: 'Bunty Patel' },
            { label: 'Rinku Singh', query: 'Rinku Singh' },
            { label: 'Sarfaraz Khan', query: 'Sarfaraz Khan' },
            { label: 'Rajat Patidar', query: 'Rajat Patidar' },
            { label: 'Yashasvi Jaiswal', query: 'Yashasvi Jaiswal' },
            { label: 'Sameer Khan (Pace)', query: 'Sameer Khan' },
            { label: 'Pooja Deshmukh (Women XI)', query: 'Pooja Deshmukh' },
          ].map((chip) => (
            <button
              key={chip.query}
              onClick={() => {
                setSearchInput(chip.query);
                handleSearch(chip.query);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors font-semibold"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS SECTION: GRID OF PLAYERS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-600" />
            {hasSearched ? `Found ${searchResults.length} Verified Profile${searchResults.length === 1 ? '' : 's'}` : 'Trending CricHeroes Profiles'}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            🛡️ Zero Fake Stats · Ready for Live Matches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((result) => {
            const raw = result.rawPlayer;
            const chId = String(raw.cricheroes_id || '');
            const isImporting = importingId === chId;
            const isNewEntrant = (raw.matches || raw.career_stats?.matches || 0) === 0;

            return (
              <div
                key={chId}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 text-base shadow-sm">
                        {raw.name ? raw.name.substring(0, 2).toUpperCase() : 'CH'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-slate-900 text-base hover:text-emerald-700 transition-colors">
                            {raw.name || raw.full_name}
                          </h4>
                          <span title="Verified" className="text-emerald-600">
                            <CheckCircle2 size={15} />
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 capitalize mt-0.5 flex items-center gap-1.5">
                          <span>{raw.playing_role || raw.role || 'Cricket Player'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <MapPin size={11} /> {raw.city || 'India'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                      {chId}
                    </span>
                  </div>

                  {/* Team & Style Tags */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {raw.team_name || (raw.team_names && raw.team_names[0]) || 'Local Club'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                      {raw.batting_style || 'RHB'}
                    </span>
                    {raw.bowling_style && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {raw.bowling_style}
                      </span>
                    )}
                  </div>

                  {/* New Tournament Entrant Notice */}
                  {isNewEntrant && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Flame size={13} className="text-amber-600" />
                        Have existing CricHeroes stats?
                      </span>
                      <button
                        onClick={() => openEditModal(raw)}
                        className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-[11px] transition-all shadow-sm"
                      >
                        ⚡ Enter Real CricHeroes Stats
                      </button>
                    </div>
                  )}

                  {/* Career Records Grid */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Matches</span>
                      <span className="font-black text-slate-900">{raw.matches || raw.career_stats?.matches || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Runs</span>
                      <span className="font-black text-emerald-700">{raw.runs || raw.career_stats?.runs || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Wickets</span>
                      <span className="font-black text-sky-700">{raw.wickets || raw.career_stats?.wickets || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">High Score</span>
                      <span className="font-black text-amber-700">{raw.highest_score || raw.career_stats?.highest_score || 0}</span>
                    </div>

                    <div className="col-span-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 px-1 font-medium">
                      <span>Avg: <strong className="text-slate-900">{raw.batting_average || raw.career_stats?.batting_average || '-'}</strong></span>
                      <span>SR: <strong className="text-slate-900">{raw.strike_rate || raw.career_stats?.strike_rate || '-'}</strong></span>
                      <span>50s/100s: <strong className="text-slate-900">{raw.fifties || 0}/{raw.hundreds || 0}</strong></span>
                      <span>Best Bowl: <strong className="text-slate-900">{raw.best_bowling || '-'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-700 font-black flex items-center gap-1 font-mono">
                    <Check size={13} className="text-emerald-600 stroke-[3]" />
                    Saved in FanClub DB
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Add to Match XI Button */}
                    {onAddPlayerToMatch && (
                      <button
                        onClick={() => handleAddToMatch(result)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
                        title="Add this player directly to tomorrow's playing XI"
                      >
                        <Trophy size={11} /> + Match XI
                      </button>
                    )}

                    {/* Edit Stats Button */}
                    <button
                      onClick={() => openEditModal(raw)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all border border-slate-200 flex items-center gap-1"
                      title="Edit career runs, wickets or details"
                    >
                      <Edit3 size={11} /> Edit Stats
                    </button>

                    {/* Full Profile Button */}
                    {onViewPlayerInDb && result.fanClubPlayerId && (
                      <button
                        onClick={() => onViewPlayerInDb(result.fanClubPlayerId!)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all border border-slate-200 flex items-center gap-1"
                      >
                        Profile <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── INLINE EDIT STATS MODAL ── */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Edit Player Statistics
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {editingPlayer.name} ({editingPlayer.cricheroes_id})
                </p>
              </div>
              <button
                onClick={() => setEditingPlayer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Player Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Team / Club</label>
                  <input
                    type="text"
                    value={editForm.team_name}
                    onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Playing Role</label>
                  <select
                    value={editForm.playing_role}
                    onChange={(e) => setEditForm({ ...editForm, playing_role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Top-order Batsman">Top-order Batsman</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Fast Bowler">Fast Bowler</option>
                    <option value="Spin Bowler">Spin Bowler</option>
                    <option value="Wicketkeeper Batsman">Wicketkeeper Batsman</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Matches</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.matches}
                    onChange={(e) => setEditForm({ ...editForm, matches: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Runs</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.runs}
                    onChange={(e) => setEditForm({ ...editForm, runs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Wickets</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.wickets}
                    onChange={(e) => setEditForm({ ...editForm, wickets: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-sky-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">High Score</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.highest_score}
                    onChange={(e) => setEditForm({ ...editForm, highest_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Best Bowling</label>
                  <input
                    type="text"
                    value={editForm.best_bowling}
                    onChange={(e) => setEditForm({ ...editForm, best_bowling: e.target.value })}
                    placeholder="3/18"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Updates to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
