// ============================================================
// FAN CLUB — CricHeroes Live Player Search & Real Ingestion UI
// Clean Daylight Light Theme — ZERO Fake Stats Guarantee
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
  ClipboardPaste,
  UserPlus,
  AlertCircle,
  Phone,
  Shield,
  FileText
} from 'lucide-react';
import { cricHeroesLookupService, type CricHeroesSearchResult } from '../../services/cricHeroesLookup';
import type { CricHeroesRawPlayer } from '../../types/cricHeroes';
import { db } from '../../db/database';
import confetti from 'canvas-confetti';

interface CricHeroesPlayerLookupProps {
  onViewPlayerInDb?: (playerId: string) => void;
}

export const CricHeroesPlayerLookup: React.FC<CricHeroesPlayerLookupProps> = ({ onViewPlayerInDb }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'paste' | 'register'>('search');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CricHeroesSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Paste Tab State
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<CricHeroesRawPlayer | null>(null);

  // Register Tab State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTeam, setRegTeam] = useState('Royal Strikers XI');
  const [regRole, setRegRole] = useState('Top-order Batsman');
  const [regBatting, setRegBatting] = useState('Right Hand Bat');
  const [regBowling, setRegBowling] = useState('Right-arm Fast');
  const [regCity, setRegCity] = useState('Mumbai');

  // Auto-run initial popular suggestions on mount
  useEffect(() => {
    handleSearch('Verma');
  }, []);

  const showNotification = (type: 'success' | 'info' | 'error', message: string) => {
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

  // Handle parsing pasted WhatsApp / CricHeroes share card
  const handleParsePasteText = () => {
    if (!pasteText.trim()) {
      showNotification('error', 'Please paste profile text from CricHeroes or WhatsApp.');
      return;
    }

    const parsed = cricHeroesLookupService.parseCricHeroesShareText(pasteText);
    if (parsed) {
      setParsedPreview(parsed);
      showNotification('info', `Successfully extracted stats for ${parsed.name}!`);
    } else {
      showNotification('error', 'Could not parse player details. Please ensure text contains name and stats.');
    }
  };

  const handleSaveParsedPlayer = () => {
    if (!parsedPreview) return;
    try {
      const res = cricHeroesLookupService.importPlayerToFanClub(parsedPreview);
      if (res.success) {
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch {}
        showNotification('success', `Verified profile for ${parsedPreview.name} saved to FanClub database!`);
        setParsedPreview(null);
        setPasteText('');
        // Switch to search and display
        setSearchInput(parsedPreview.name || '');
        handleSearch(parsedPreview.name || '');
        setActiveTab('search');
      }
    } catch (e: any) {
      showNotification('error', 'Failed to save parsed player: ' + e.message);
    }
  };

  // Handle Registering Genuine Tournament Player (0/0 Clean Stats)
  const handleRegisterPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      showNotification('error', 'Please enter player name.');
      return;
    }

    try {
      const res = cricHeroesLookupService.registerTournamentPlayer({
        name: regName,
        phone: regPhone,
        teamName: regTeam,
        role: regRole,
        battingStyle: regBatting,
        bowlingStyle: regBowling,
        city: regCity,
      });

      if (res.success) {
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch {}
        showNotification('success', res.message);
        const savedPlayerName = regName;
        setRegName('');
        setRegPhone('');
        // Switch to search and display newly registered player
        setSearchInput(savedPlayerName);
        handleSearch(savedPlayerName);
        setActiveTab('search');
      }
    } catch (e: any) {
      showNotification('error', 'Failed to register player: ' + e.message);
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
            {notification.type === 'error' && <AlertCircle size={16} className="text-rose-600" />}
            {notification.type === 'info' && <Sparkles size={16} className="text-blue-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold hover:opacity-75">✕</button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'search'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search size={14} /> Search CricHeroes & FanClub
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'paste'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardPaste size={14} /> Paste CricHeroes / WhatsApp Text
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
            activeTab === 'register'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus size={14} /> ➕ Add Tournament Player (0/0)
        </button>
      </div>

      {/* ──────────────── TAB 1: SEARCH ──────────────── */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck size={14} className="text-emerald-600" /> AUTHENTIC CRICKET PLAYER DIRECTORY
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Search Player by CricHeroes ID or Name
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Search our verified Indian player directory and local club database. Zero fake statistics: players display either verified career records or clean slates (0/0) ready for live scoring.
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
                  placeholder="Search by CricHeroes ID or Name (e.g. Aakash Verma, Bunty Patel, Sameer Khan, CH-88019)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchInput.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
              >
                {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
                Search
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Verified Catalog:</span>
              {[
                { label: 'Aakash Verma (Mumbai)', query: 'Aakash Verma' },
                { label: 'Bunty Patel (Sixer King)', query: 'Bunty Patel' },
                { label: 'Krishna Satpute', query: 'Krishna Satpute' },
                { label: 'Sameer Khan', query: 'Sameer Khan' },
                { label: 'Rahul R. Sharma', query: 'Rahul R. Sharma' },
                { label: 'Pooja Deshmukh (Women XI)', query: 'Pooja Deshmukh' },
                { label: 'CH-88019', query: 'CH-88019' },
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
                {hasSearched ? `Found ${searchResults.length} Player Profile${searchResults.length === 1 ? '' : 's'}` : 'Trending Verified Players'}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                🛡️ Zero Fabricated Stats · Authentic Records
              </span>
            </div>

            {/* NO RESULTS FOUND STATE: Informative & Actionable (No Fake Stats) */}
            {hasSearched && searchResults.length === 0 && (
              <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  No CricHeroes Profile Found for &ldquo;{searchInput}&rdquo;
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  We don&apos;t invent or synthesize fake runs or wickets. You can register <strong>{searchInput}</strong> as a tournament player starting fresh from ball 1, or paste their CricHeroes share text.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setRegName(searchInput);
                      setActiveTab('register');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
                  >
                    <UserPlus size={14} /> Register &ldquo;{searchInput}&rdquo; as Tournament Player
                  </button>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all border border-slate-300 flex items-center gap-2"
                  >
                    <ClipboardPaste size={14} /> Paste CricHeroes WhatsApp Card
                  </button>
                </div>
              </div>
            )}

            {/* RESULTS GRID */}
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

                      {/* Complete Career Records Grid */}
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
                        Verified Profile
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check size={12} className="stroke-[3]" /> Saved in FanClub
                        </span>
                        <button
                          onClick={() => handleSyncAgain(raw)}
                          disabled={isImporting}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1"
                          title="Re-sync latest stats"
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
      )}

      {/* ──────────────── TAB 2: PASTE CRICHEROES SHARE TEXT ──────────────── */}
      {activeTab === 'paste' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
              <ClipboardPaste size={14} className="text-emerald-600" /> INSTANT PROFILE PARSER
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Paste CricHeroes WhatsApp Share or Profile Text
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              When a player shares their profile via the CricHeroes app or WhatsApp, paste the text or link below. Our parser extracts the exact genuine matches, runs, wickets, high score, and average with 100% fidelity.
            </p>

            <div className="mt-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                placeholder={`Example WhatsApp share text:
Check out Rajesh Kumar's profile on CricHeroes!
Role: All-Rounder
Matches: 45
Runs: 1120
High Score: 84*
Average: 32.0
Strike Rate: 138.5
Wickets: 38
Best Bowling: 4/18
Team: Shivaji Park XI
City: Mumbai`}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  💡 Tip: You can also paste CricHeroes profile URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold font-mono">https://cricheroes.com/player-profile/88019/aakash-verma</code>
                </span>
                <button
                  onClick={handleParsePasteText}
                  disabled={!pasteText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 flex items-center gap-2"
                >
                  <Sparkles size={14} /> Parse Genuine Stats
                </button>
              </div>
            </div>
          </div>

          {/* PARSED PREVIEW CARD */}
          {parsedPreview && (
            <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
                    {(parsedPreview.name || 'CH').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{parsedPreview.name || 'Tournament Player'}</h4>
                    <p className="text-xs text-slate-500">
                      {parsedPreview.playing_role} • {parsedPreview.city} • {parsedPreview.team_name}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                  Extracted Authentic Profile
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Matches</span>
                  <span className="text-lg font-black text-slate-900">{parsedPreview.matches}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Runs</span>
                  <span className="text-lg font-black text-emerald-700">{parsedPreview.runs}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Wickets</span>
                  <span className="text-lg font-black text-sky-700">{parsedPreview.wickets}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">High Score</span>
                  <span className="text-lg font-black text-amber-700">{parsedPreview.highest_score}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 font-semibold">
                <span>Avg: <strong className="text-slate-900">{parsedPreview.batting_average}</strong></span>
                <span>SR: <strong className="text-slate-900">{parsedPreview.strike_rate}</strong></span>
                <span>Best Bowling: <strong className="text-slate-900">{parsedPreview.best_bowling}</strong></span>
                <span>Catches: <strong className="text-slate-900">{parsedPreview.catches}</strong></span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setParsedPreview(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveParsedPlayer}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
                >
                  <Check size={14} /> Save Real Profile to FanClub Database
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: REGISTER TOURNAMENT PLAYER ──────────────── */}
      {activeTab === 'register' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
            <UserPlus size={14} className="text-emerald-600" /> GRASSROOTS TOURNAMENT PLAYER ONBOARDING
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Register Player for Tomorrow&apos;s Tournament
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Players start with a clean slate: <strong>0 matches, 0 runs, 0 wickets</strong>. Their career statistics will be built ball-by-ball from your live scoring starting tomorrow.
          </p>

          <form onSubmit={handleRegisterPlayer} className="mt-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (+91)</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Team / Club</label>
                <select
                  value={regTeam}
                  onChange={(e) => setRegTeam(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Royal Strikers XI">Royal Strikers XI</option>
                  <option value="Mumbai Warriors CC">Mumbai Warriors CC</option>
                  <option value="Shivaji Park Youngsters">Shivaji Park Youngsters</option>
                  <option value="Azad Maidan Boys">Azad Maidan Boys</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Playing Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Top-order Batsman">Top-order Batsman</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Fast Bowler">Fast Bowler</option>
                  <option value="Spin Bowler">Spin Bowler</option>
                  <option value="Wicketkeeper Batsman">Wicketkeeper Batsman</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Batting Style</label>
                <select
                  value={regBatting}
                  onChange={(e) => setRegBatting(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Right Hand Bat">Right Hand Bat (RHB)</option>
                  <option value="Left Hand Bat">Left Hand Bat (LHB)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bowling Style</label>
                <select
                  value={regBowling}
                  onChange={(e) => setRegBowling(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Right-arm Fast">Right-arm Fast</option>
                  <option value="Right-arm Fast-Medium">Right-arm Fast-Medium</option>
                  <option value="Right-arm Medium">Right-arm Medium</option>
                  <option value="Right-arm Off-Spin">Right-arm Off-Spin</option>
                  <option value="Right-arm Leg-Spin">Right-arm Leg-Spin</option>
                  <option value="Left-arm Fast">Left-arm Fast</option>
                  <option value="Left-arm Orthodox Spin">Left-arm Orthodox Spin</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                <Shield size={12} className="text-emerald-600" />
                Starts at 0 runs, 0 wkts — scored live ball-by-ball tomorrow
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
              >
                <Check size={14} /> Register & Save to Database
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
