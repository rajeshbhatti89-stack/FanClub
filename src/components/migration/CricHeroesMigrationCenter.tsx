// ============================================================
// FAN CLUB — CricHeroes Player Database Migration Centre
// Complete automated import, duplicate resolution, and auditing suite
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cricHeroesMigrationEngine } from '../../services/cricHeroesMigration';
import { db } from '../../db/database';
import { CricHeroesPlayerLookup } from './CricHeroesPlayerLookup';
import type { 
  CricHeroesMigrationJob, 
  CricHeroesDuplicateCandidate, 
  CricHeroesRawPlayer 
} from '../../types/cricHeroes';
import type { AuditLogEntry } from '../../types/database';

export const CricHeroesMigrationCenter: React.FC = () => {
  const [activeJob, setActiveJob] = useState<CricHeroesMigrationJob | null>(
    cricHeroesMigrationEngine.getActiveJob()
  );
  const [isRunning, setIsRunning] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'lookup' | 'sample' | 'csv' | 'json' | 'api'>('lookup');
  const [duplicateCandidates, setDuplicateCandidates] = useState<CricHeroesDuplicateCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CricHeroesDuplicateCandidate | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync state from db
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setLogs(db.getAuditLogs('migration'));
    });
    setLogs(db.getAuditLogs('migration'));
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Sample CricHeroes Dataset generator for immediate testing
  const handleLoadSampleDataset = async () => {
    setIsRunning(true);
    const samplePlayers: CricHeroesRawPlayer[] = [
      {
        cricheroes_id: 'CH-88019',
        full_name: 'Aakash Verma',
        name: 'Aakash Verma',
        country: 'India',
        state: 'Maharashtra',
        city: 'Mumbai',
        playing_role: 'Top-order Batsman',
        batting_style: 'Right Hand Bat',
        bowling_style: 'Right-arm Off-Spin',
        date_of_birth: '1998-04-12',
        team_names: ['Shivaji Park Youngsters', 'Mumbai Under-23'],
        career_stats: {
          matches: 68,
          innings: 62,
          runs: 2450,
          highest_score: 114,
          not_outs: 8,
          fifties: 16,
          hundreds: 3,
          strike_rate: 142.5,
          batting_average: 45.37,
          wickets: 12,
          bowling_economy: 7.2,
          best_bowling: '3/18',
          catches: 28,
        }
      },
      {
        cricheroes_id: 'CH-88020',
        full_name: 'Sameer Khan',
        name: 'Sameer Khan',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
        playing_role: 'Fast Bowler',
        batting_style: 'Right Hand Bat',
        bowling_style: 'Right-arm Fast',
        team_names: ['Delhi Strikers CC'],
        career_stats: {
          matches: 84,
          innings: 24,
          runs: 310,
          highest_score: 34,
          not_outs: 11,
          fifties: 0,
          hundreds: 0,
          strike_rate: 115.0,
          batting_average: 23.8,
          wickets: 118,
          bowling_economy: 6.45,
          best_bowling: '5/14',
          catches: 18,
        }
      },
      {
        cricheroes_id: 'CH-88021',
        full_name: 'Rahul R. Sharma',
        name: 'Rahul Sharma',
        country: 'India',
        city: 'Bangalore',
        playing_role: 'Wicketkeeper Batsman',
        batting_style: 'Left Hand Bat',
        team_names: ['Bangalore Eagles'],
        career_stats: {
          matches: 92,
          innings: 88,
          runs: 3120,
          highest_score: 96,
          not_outs: 14,
          fifties: 22,
          hundreds: 0,
          strike_rate: 138.2,
          batting_average: 42.16,
          wickets: 0,
          catches: 62,
          stumpings: 19,
        }
      },
      {
        cricheroes_id: 'CH-88022',
        full_name: 'Mohit Deshmukh',
        name: 'Mohit Deshmukh',
        country: 'India',
        city: 'Pune',
        playing_role: 'All Rounder',
        batting_style: 'Right Hand Bat',
        bowling_style: 'Right-arm Medium',
        team_names: ['Deccan Warriors'],
        career_stats: {
          matches: 55,
          innings: 48,
          runs: 1420,
          highest_score: 82,
          not_outs: 9,
          fifties: 8,
          hundreds: 0,
          strike_rate: 148.9,
          batting_average: 36.4,
          wickets: 64,
          bowling_economy: 7.8,
          best_bowling: '4/21',
          catches: 21,
        }
      },
      {
        cricheroes_id: 'CH-88023',
        full_name: 'Virat Kohli', // Intentionally matching seed player to test duplicate detection
        name: 'Virat Kohli',
        country: 'India',
        city: 'Delhi',
        playing_role: 'Batsman',
        batting_style: 'Right Hand Bat',
        career_stats: {
          matches: 535,
          runs: 27100,
          highest_score: 254,
          wickets: 9,
        }
      }
    ];

    try {
      const report = await cricHeroesMigrationEngine.executeMigration(
        samplePlayers,
        'authorized_json',
        (updatedJob) => {
          setActiveJob({ ...updatedJob });
          setDuplicateCandidates(updatedJob.duplicateCandidates);
        }
      );
      showNotification(`Migration complete! Successfully processed ${report.totalProcessed} records.`);
    } catch (e: any) {
      showNotification(`Migration failed: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartCsvImport = async () => {
    if (!csvInput.trim()) {
      alert('Please paste valid CSV content or upload a CSV file.');
      return;
    }
    const rawList = cricHeroesMigrationEngine.parseCsvToRaw(csvInput);
    if (rawList.length === 0) {
      alert('Could not parse any player rows from the provided CSV.');
      return;
    }

    setIsRunning(true);
    try {
      await cricHeroesMigrationEngine.executeMigration(
        rawList,
        'authorized_csv',
        (updatedJob) => {
          setActiveJob({ ...updatedJob });
          setDuplicateCandidates(updatedJob.duplicateCandidates);
        }
      );
      showNotification(`Imported ${rawList.length} records from CSV.`);
    } catch (e: any) {
      showNotification(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStartJsonImport = async () => {
    if (!jsonInput.trim()) {
      alert('Please paste a JSON array of CricHeroes player records.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const list: CricHeroesRawPlayer[] = Array.isArray(parsed) ? parsed : [parsed];
      setIsRunning(true);
      await cricHeroesMigrationEngine.executeMigration(
        list,
        'authorized_json',
        (updatedJob) => {
          setActiveJob({ ...updatedJob });
          setDuplicateCandidates(updatedJob.duplicateCandidates);
        }
      );
      showNotification(`Imported ${list.length} records from JSON.`);
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResolveDuplicate = (
    candidate: CricHeroesDuplicateCandidate,
    resolution: 'keep_existing' | 'update_with_incoming' | 'create_separate'
  ) => {
    cricHeroesMigrationEngine.resolveDuplicate(candidate, resolution);
    setDuplicateCandidates((prev) => prev.filter((c) => c.incomingRecord.id !== candidate.incomingRecord.id));
    setSelectedCandidate(null);
    showNotification(`Resolved conflict for ${candidate.incomingRecord.name} (${resolution})`);
  };

  const downloadSampleCsv = () => {
    const csvContent = `id,name,role,batting_style,bowling_style,city,country,matches,runs,wickets,highest_score\nCH-101,Rohan Kulkarni,Batsman,Right Hand Bat,Right-arm Medium,Pune,India,42,1280,6,88\nCH-102,Zubair Ahmed,Bowler,Right Hand Bat,Right-arm Fast,Hyderabad,India,55,140,84,22\nCH-103,Naveen Kumar,All Rounder,Left Hand Bat,Left-arm Orthodox Spin,Chennai,India,38,760,45,64`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cricHeroes_authorized_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allPlayersCount = db.getPlayers().length;
  const migratedFromChCount = db.getPlayers().filter((p) => p.dataProvenance.source === 'cricHeroes').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 border border-emerald-300 animate-bounce">
          <Sparkles size={16} /> {notification}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-3">
              <Database size={13} /> CRICHEROES DATA MIGRATION ENGINE
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              CricHeroes Migration Centre
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl leading-relaxed">
              Automated player discovery, identity resolution, format statistic normalization, and bulk synchronization.
              Full provenance tracking and duplicate detection with conflict resolution safeguards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLoadSampleDataset}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={15} /> Run Live Test Migration
            </button>
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              <Download size={14} /> Download CSV Template
            </button>
          </div>
        </div>

        {/* Real-time Metric Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Database Players</div>
            <div className="text-2xl font-black text-white mt-1">{allPlayersCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Global active registry</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Migrated From CricHeroes</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{migratedFromChCount}</div>
            <div className="text-[11px] text-emerald-500/80 mt-1">Verified provenance</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Duplicate Candidates</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{duplicateCandidates.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pending admin resolution</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 uppercase font-semibold">Engine Compliance</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">100%</div>
            <div className="text-[11px] text-slate-500 mt-1">Authorized terms & APIs</div>
          </div>
        </div>
      </div>

      {/* Main Tabs / Workflows */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Import Engine Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl flex-wrap">
            {[
              { id: 'lookup', label: '🔍 Search by ID / Name', highlight: true },
              { id: 'sample', label: '1-Click Sample' },
              { id: 'csv', label: 'CSV Bulk Upload' },
              { id: 'json', label: 'JSON Dataset' },
              { id: 'api', label: 'API Connector' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setImportMode(m.id as any)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  importMode === m.id
                    ? m.highlight
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : m.highlight
                    ? 'text-amber-400 hover:text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode Content: Live Lookup */}
          {importMode === 'lookup' && (
            <CricHeroesPlayerLookup />
          )}

          {/* Mode Content: Sample */}
          {importMode === 'sample' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-extrabold text-lg text-white">Instant CricHeroes Migration Test</h3>
              <p className="text-xs text-slate-400 mt-1">
                Executes the migration engine over a curated 5-player CricHeroes dataset containing batsmanship records,
                bowling hauls, tournament memberships, and an intentional duplicate to test identity scoring.
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div>• Aakash Verma (CH-88019) → Shivaji Park CC Prodigy (2,450 Runs)</div>
                <div>• Sameer Khan (CH-88020) → Delhi Fast Bowler (118 Wickets)</div>
                <div>• Rahul Sharma (CH-88021) → Wicketkeeper (3,120 Runs)</div>
                <div>• Mohit Deshmukh (CH-88022) → All-rounder (1,420 Runs, 64 Wickets)</div>
                <div>• Virat Kohli (CH-88023) → Triggers duplicate match candidate</div>
              </div>
              <button
                onClick={handleLoadSampleDataset}
                disabled={isRunning}
                className="mt-5 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
              >
                {isRunning ? 'Processing Batch Migration...' : 'Start Sample Batch Migration'}
              </button>
            </div>
          )}

          {/* Mode Content: CSV Upload */}
          {importMode === 'csv' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-white">CSV File Import</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste raw CSV lines or export from CricHeroes / local club registries.
                  </p>
                </div>
                <button
                  onClick={downloadSampleCsv}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Download size={12} /> Template
                </button>
              </div>

              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="id,name,role,batting_style,city,country,matches,runs,wickets&#10;CH-201,Kunal Patil,Batsman,Right Hand Bat,Mumbai,India,50,1850,2"
                rows={8}
                className="mt-4 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setCsvInput('')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Clear
                </button>
                <button
                  onClick={handleStartCsvImport}
                  disabled={isRunning || !csvInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all disabled:opacity-50"
                >
                  {isRunning ? 'Importing CSV...' : 'Process & Ingest CSV'}
                </button>
              </div>
            </div>
          )}

          {/* Mode Content: JSON Import */}
          {importMode === 'json' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-extrabold text-lg text-white">JSON Array Ingestion</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste structured CricHeroes API response JSON or export bundle.
              </p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[&#10;  {&#10;    "cricheroes_id": "CH-301",&#10;    "name": "Devendra Joshi",&#10;    "playing_role": "Bowler",&#10;    "career_stats": { "matches": 30, "wickets": 45 }&#10;  }&#10;]'
                rows={8}
                className="mt-4 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setJsonInput('')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Clear
                </button>
                <button
                  onClick={handleStartJsonImport}
                  disabled={isRunning || !jsonInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all disabled:opacity-50"
                >
                  {isRunning ? 'Ingesting JSON...' : 'Validate & Import JSON'}
                </button>
              </div>
            </div>
          )}

          {/* Mode Content: API Connector */}
          {importMode === 'api' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-extrabold text-lg text-white">Authorized CricHeroes API Connector</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your official developer credentials or authorized enterprise partnership endpoint.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">API Base URL</label>
                  <input
                    type="text"
                    defaultValue="https://api.cricheroes.in/v1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Partner Client ID</label>
                  <input
                    type="text"
                    placeholder="partner_fanclub_production"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Access Token / Secret</label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  Official CricHeroes data licensing agreement required for continuous background cron syncing.
                  Manual and CSV exports are permitted under standard organization access policies.
                </span>
              </div>
            </div>
          )}

          {/* Duplicate Conflict Candidates Section */}
          {duplicateCandidates.length > 0 && (
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-400" size={18} />
                  <h3 className="font-extrabold text-white text-base">
                    Duplicate Candidates Needing Review ({duplicateCandidates.length})
                  </h3>
                </div>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  Confidence Score &gt; 65%
                </span>
              </div>

              <div className="space-y-3">
                {duplicateCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {cand.incomingRecord.full_name || cand.incomingRecord.name}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Match: {Math.round(cand.confidenceScore * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Matched with existing FanClub player:{' '}
                        <strong className="text-emerald-400">{cand.existingPlayer.name}</strong> ({cand.existingPlayer.fanClubId})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Incoming: {cand.incomingRecord.city || 'N/A'}, {cand.incomingRecord.career_stats?.runs || cand.incomingRecord.runs || 0} Runs vs Existing: {cand.existingPlayer.country}, {cand.existingPlayer.overallStats.runs} Runs
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleResolveDuplicate(cand, 'update_with_incoming')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40"
                      >
                        Merge Stats
                      </button>
                      <button
                        onClick={() => handleResolveDuplicate(cand, 'keep_existing')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                      >
                        Keep Existing
                      </button>
                      <button
                        onClick={() => handleResolveDuplicate(cand, 'create_separate')}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40"
                      >
                        New Separate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Migration Logs & Activity */}
        <div className="space-y-6">
          {/* Active Job Progress Card */}
          {activeJob && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Active Ingestion Job
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black ${
                    activeJob.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : activeJob.status === 'running'
                      ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {activeJob.status}
                </span>
              </div>

              <h4 className="font-extrabold text-white text-sm mt-2">{activeJob.title}</h4>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                  <span>Progress</span>
                  <span>
                    {activeJob.processedRecords} / {activeJob.totalRecords}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${
                        activeJob.totalRecords > 0
                          ? (activeJob.processedRecords / activeJob.totalRecords) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded-xl">
                  <div className="text-slate-500 text-[10px] uppercase">Imported</div>
                  <div className="font-bold text-emerald-400">{activeJob.importedCount}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl">
                  <div className="text-slate-500 text-[10px] uppercase">Updated</div>
                  <div className="font-bold text-cyan-400">{activeJob.updatedCount}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl">
                  <div className="text-slate-500 text-[10px] uppercase">Duplicates</div>
                  <div className="font-bold text-amber-400">{activeJob.duplicateCount}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl">
                  <div className="text-slate-500 text-[10px] uppercase">Failures</div>
                  <div className="font-bold text-red-400">{activeJob.failedCount}</div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-emerald-400" /> Migration Audit Log
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{logs.length} entries</span>
            </div>

            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No migration events recorded yet.
                </div>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 mt-1 text-[11px] leading-snug">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
