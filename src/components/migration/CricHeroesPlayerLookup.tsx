// ============================================================
// FAN CLUB — CricHeroes Live Player Search & Direct Ingestion UI
// Clean Daylight Light Theme with Universal Zero-Import Auto-Sync
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
  Flame,
  Zap,
  MapPin
} from 'lucide-react';
import { cricHeroesLookupService, type CricHeroesSearchResult } from '../../services/cricHeroesLookup';
import type { CricHeroesRawPlayer } from '../../types/cricHeroes';
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

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles size={14} className="text-emerald-600" /> LIVE CRICHEROES AUTO-SYNC ENGINE
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Search Any Player by CricHeroes ID or Name
        </h3>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Type any player&apos;s <strong>CricHeroes Player ID</strong> (e.g. <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold">CH-88019</code>, <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold">CH-TB-551</code>), <strong>Player Name</strong>, or <strong>Profile URL</strong>. Every search result is <strong>automatically synchronized & saved</strong> into your Fan Club relational database immediately!
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
              placeholder="Search by CricHeroes ID or Player Name (e.g. Aakash Verma, Bunty Patel, Virat, Sameer)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
          >
            {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
            Search & Auto-Sync
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Popular Searches:</span>
          {[
            { label: 'Aakash Verma', query: 'Aakash Verma' },
            { label: 'Bunty Patel (Sixer King)', query: 'Bunty Patel' },
            { label: 'Krishna Satpute', query: 'Krishna Satpute' },
            { label: 'Sameer Khan', query: 'Sameer Khan' },
            { label: 'Pooja Deshmukh', query: 'Pooja Deshmukh' },
            { label: 'Virat Kohli', query: 'Virat' },
            { label: 'CH-88019', query: 'CH-88019' },
            { label: 'CH-TB-701', query: 'CH-TB-701' },
          ].map((chip) => (
            <button
              key={chip.query}
              onClick={() => {
                setSearchInput(chip.query);
                handleSearch(chip.query);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors font-semibold"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-600" />
            {hasSearched ? `Found ${searchResults.length} Verified Profile${searchResults.length === 1 ? '' : 's'}` : 'Trending Profiles'}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ⚡ 100% Auto-Saved in FanClub DB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((result) => {
            const raw = result.rawPlayer;
            const chId = String(raw.cricheroes_id || '');
            const isImporting = importingId === chId;

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

                  {/* Complete CricHeroes Career Records Grid */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-4 gap-2 text-center text-xs">
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
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Synced & Verified
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check size={12} className="stroke-[3]" /> Saved in FanClub
                    </span>
                    <button
                      onClick={() => handleSyncAgain(raw)}
                      disabled={isImporting}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1"
                      title="Re-sync latest stats from CricHeroes"
                    >
                      <RefreshCw size={11} className={isImporting ? 'animate-spin' : ''} /> Sync
                    </button>
                    {onViewPlayerInDb && result.fanClubPlayerId && (
                      <button
                        onClick={() => onViewPlayerInDb(result.fanClubPlayerId!)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1 shadow-sm"
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
    </div>
  );
};
