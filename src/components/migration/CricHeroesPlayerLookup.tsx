// ============================================================
// FAN CLUB — CricHeroes Live Player Search & Direct Ingestion UI
// Search by CricHeroes ID or Name & Save Directly to Database
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Trophy, 
  ArrowRight, 
  Info, 
  Check, 
  Flame,
  Award
} from 'lucide-react';
import { cricHeroesLookupService, type CricHeroesSearchResult } from '../../services/cricHeroesLookup';
import type { CricHeroesRawPlayer } from '../../types/cricHeroes';
import { db } from '../../db/database';
import confetti from 'canvas-confetti';

interface CricHeroesPlayerLookupProps {
  onViewPlayerInDb?: (playerId: string) => void;
}

export const CricHeroesPlayerLookup: React.FC<CricHeroesPlayerLookupProps> = ({ onViewPlayerInDb }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CricHeroesSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Auto-run initial popular suggestions on mount
  useEffect(() => {
    handleSearch('Verma');
  }, []);

  const showNotification = (type: 'success' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImportSingle = async (rawPlayer: CricHeroesRawPlayer) => {
    const chId = String(rawPlayer.cricheroes_id || '');
    setImportingId(chId);

    try {
      const res = cricHeroesLookupService.importPlayerToFanClub(rawPlayer);
      if (res.success) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}

        showNotification('success', res.message);

        // Re-run search to update "isAlreadyInFanClub" state
        const updated = await cricHeroesLookupService.searchCricHeroesDatabase(searchInput || rawPlayer.name || chId);
        setSearchResults(updated);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles size={14} /> LIVE CRICHEROES PROFILE DISCOVERY & INGESTION
        </div>
        <h3 className="text-xl font-black text-white">
          Search by CricHeroes Player ID or Name
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Enter any player's <strong>CricHeroes Player ID</strong> (e.g. <code className="text-amber-300 font-mono">CH-88019</code>, <code className="text-amber-300 font-mono">CH-TB-551</code>), <strong>Player Name</strong>, or <strong>Profile URL</strong>. Preview their live batting and bowling records and save them permanently to your Fan Club platform in 1 click!
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
              placeholder="Enter CricHeroes ID (e.g. CH-88019) or Player Name (e.g. Aakash Verma, Bunty Patel)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
            Search CricHeroes
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">Quick Searches:</span>
          {[
            { label: 'CH-88019 (Aakash Verma)', query: 'CH-88019' },
            { label: 'CH-TB-551 (Bunty Patel)', query: 'CH-TB-551' },
            { label: 'CH-88020 (Sameer Khan)', query: 'CH-88020' },
            { label: 'CH-W-881 (Pooja Deshmukh)', query: 'CH-W-881' },
            { label: 'CH-VIL-101 (Dnyaneshwar)', query: 'CH-VIL-101' },
            { label: 'CH-991823 (Virat)', query: 'CH-991823' },
          ].map((chip) => (
            <button
              key={chip.query}
              onClick={() => {
                setSearchInput(chip.query);
                handleSearch(chip.query);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 transition-colors font-mono"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>
            {hasSearched ? `Found ${searchResults.length} CricHeroes Profile${searchResults.length === 1 ? '' : 's'}` : 'Popular CricHeroes Profiles'}
          </span>
          <span className="text-[11px] text-slate-500">Click "Save to FanClub" to store in permanent database</span>
        </div>

        {searchResults.length === 0 && hasSearched && (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500">
            <User className="mx-auto mb-2 text-slate-600" size={32} />
            <p className="text-sm font-bold text-slate-300">No CricHeroes profiles matched "{searchInput}"</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching by player ID (e.g. <span className="font-mono text-amber-400">CH-88019</span>) or a player full name.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((result) => {
            const raw = result.rawPlayer;
            const chId = String(raw.cricheroes_id || '');
            const isImporting = importingId === chId;

            return (
              <div
                key={chId}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-base shadow-inner">
                        {raw.name ? raw.name.substring(0, 2).toUpperCase() : 'CH'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-white text-base hover:text-amber-400 transition-colors">
                            {raw.name || raw.full_name}
                          </h4>
                          <span title="CricHeroes Verified" className="text-emerald-400">
                            <CheckCircle2 size={14} />
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 capitalize mt-0.5">
                          {raw.playing_role || raw.role || 'Cricket Player'} • {raw.city || 'India'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {chId}
                    </span>
                  </div>

                  {/* Team & Style Tags */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {raw.team_name || (raw.team_names && raw.team_names[0]) || 'Local Club'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {raw.batting_style || 'RHB'}
                    </span>
                    {raw.bowling_style && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {raw.bowling_style}
                      </span>
                    )}
                  </div>

                  {/* Complete CricHeroes Career Records Grid */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Matches</span>
                      <span className="font-black text-white">{raw.matches || raw.career_stats?.matches || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Runs</span>
                      <span className="font-black text-emerald-400">{raw.runs || raw.career_stats?.runs || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Wickets</span>
                      <span className="font-black text-cyan-400">{raw.wickets || raw.career_stats?.wickets || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">High Score</span>
                      <span className="font-black text-amber-400">{raw.highest_score || raw.career_stats?.highest_score || 0}</span>
                    </div>

                    <div className="col-span-4 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>Avg: <strong className="text-white">{raw.batting_average || raw.career_stats?.batting_average || '-'}</strong></span>
                      <span>SR: <strong className="text-white">{raw.strike_rate || raw.career_stats?.strike_rate || '-'}</strong></span>
                      <span>50s/100s: <strong className="text-white">{raw.fifties || 0}/{raw.hundreds || 0}</strong></span>
                      <span>Best Bowl: <strong className="text-white">{raw.best_bowling || '-'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    CricHeroes Verified Source
                  </span>

                  {result.isAlreadyInFanClub ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check size={12} /> Saved in FanClub
                      </span>
                      <button
                        onClick={() => handleImportSingle(raw)}
                        disabled={isImporting}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
                        title="Re-synchronize latest stats from CricHeroes"
                      >
                        <RefreshCw size={11} className={isImporting ? 'animate-spin' : ''} /> Sync
                      </button>
                      {onViewPlayerInDb && result.fanClubPlayerId && (
                        <button
                          onClick={() => onViewPlayerInDb(result.fanClubPlayerId!)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1"
                        >
                          View <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleImportSingle(raw)}
                      disabled={isImporting}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Saving Records...
                        </>
                      ) : (
                        <>
                          <Download size={13} />
                          Import & Save to FanClub
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
