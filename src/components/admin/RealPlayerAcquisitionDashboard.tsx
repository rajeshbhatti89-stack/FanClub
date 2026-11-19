// ============================================================
// FAN CLUB — Real Player Acquisition Admin Dashboard
// Provenance Auditing, Source Breakdown, CricHeroes Blocker Report,
// Batch Lifecycle Management & One-Click Rollback Controls
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Users, 
  Clock, 
  Layers, 
  Building2, 
  Trophy, 
  GraduationCap, 
  Award, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { db } from '../../db/database';
import type { Player } from '../../types/cricket';
import type { ImportBatchRecord, AuditLogEntry } from '../../types/database';

export const RealPlayerAcquisitionDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(db.getPlayers());
  const [batches, setBatches] = useState<ImportBatchRecord[]>(db.getImportBatches());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(db.getAuditLogs('migration'));
  const [confirmRollbackBatch, setConfirmRollbackBatch] = useState<ImportBatchRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPlayers(db.getPlayers());
      setBatches(db.getImportBatches());
      setAuditLogs(db.getAuditLogs('migration'));
    });
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Calculations
  const totalGenuine = players.length;
  const localClubCount = players.filter(p => p.isLocalClub).length;
  const proCount = players.filter(p => p.isInternational || p.isDomestic).length;
  const verifiedCount = players.filter(p => p.isVerified || p.verificationStatus === 'verified').length;
  const unverifiedCount = players.filter(p => !p.isVerified && p.verificationStatus !== 'verified').length;

  // Source-wise Breakdown
  const sourceBreakdown = players.reduce((acc, p) => {
    const s = p.dataProvenance?.source || 'system';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Execute Rollback
  const handleExecuteRollback = () => {
    if (!confirmRollbackBatch) return;
    const res = db.rollbackBatch(confirmRollbackBatch.batchId);
    setConfirmRollbackBatch(null);
    if (res.success) {
      showNotification(`Rollback Successful: ${res.playersRemoved} genuine players safely removed.`);
    } else {
      showNotification(`Rollback Failed: ${res.message}`);
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Genuine Players</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalGenuine}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{localClubCount}</span> Grassroots & Local
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Verification Status</span>
            <ShieldCheck size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{verifiedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-bold">{unverifiedCount}</span> Pending Player Claim
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Import Batches Executed</span>
            <FileSpreadsheet size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{batches.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {batches.filter(b => b.status === 'completed').length} Active • {batches.filter(b => b.status === 'rolled_back').length} Rolled Back
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Pro vs Grassroots</span>
            <Trophy size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {Math.round((localClubCount / Math.max(1, totalGenuine)) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {localClubCount} Grassroots / {proCount} International
          </div>
        </div>
      </div>

      {/* Official CricHeroes Data Access & Legal Blocker Transparency Report */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <ShieldCheck size={28} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LEGAL & INTEGRATION DISCLOSURE
              </span>
              <span className="text-xs text-slate-400">Status: Verified Direct Onboarding Strategy Active</span>
            </div>

            <h3 className="text-lg font-black text-white mt-2">
              CricHeroes API Availability & Zero-Scraping Compliance Audit
            </h3>

            <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. No Public REST API Key:</strong> CricHeroes (<code className="text-slate-200">cricheroes.com</code>) does not provide a public, self-serve developer API key. CricHeroes API partnerships require a custom institutional enterprise contract and B2B data licensing.
              </p>
              <p>
                <strong>2. Terms of Service Prohibition:</strong> Automated screen-scraping, bot crawling, reverse-engineering mobile API endpoints, and bypassing SMS/OTP/CAPTCHA protections are strictly prohibited under Section 4 and 7 of CricHeroes Terms of Service.
              </p>
              <p>
                <strong>3. Fan Club's Authorized Acquisition Solution:</strong> Instead of fragile and illegal scraping, Fan Club uses a direct, authorized player acquisition pipeline. Team managers, tournament directors, and scorers upload authorized Excel (<code className="text-emerald-400">.xlsx</code>, <code className="text-emerald-400">.xls</code>) and CSV rosters. Grassroots cricketers can search and claim their profile with phone OTP and ID verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sources & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />
            Player Acquisition Sources Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(sourceBreakdown).map(([src, count]) => {
              const pct = Math.round((count / totalGenuine) * 100);
              return (
                <div key={src} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 capitalize">{src.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grassroots Division Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            Grassroots Divisions Active
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Village & District', key: 'village_district', icon: <Trophy size={14} className="text-amber-400" /> },
              { label: 'Corporate Leagues', key: 'corporate', icon: <Building2 size={14} className="text-cyan-400" /> },
              { label: 'School & College', key: 'school_college', icon: <GraduationCap size={14} className="text-emerald-400" /> },
              { label: 'Tennis Ball Cricket', key: 'tennis_ball', icon: <Layers size={14} className="text-rose-400" /> },
              { label: "Women's Cricket", key: 'womens_cricket', icon: <Award size={14} className="text-purple-400" /> },
              { label: 'City & State Clubs', key: 'city_club', icon: <ShieldCheck size={14} className="text-blue-400" /> },
            ].map(div => {
              const count = players.filter(p => p.grassrootsCategory === div.key).length;
              return (
                <div key={div.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    {div.icon}
                    <span className="truncate">{div.label}</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Batch History & Rollback Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-white text-sm">
              Roster Import Batch Registry & Rollback Controls
            </h3>
            <p className="text-xs text-slate-400">
              Every imported batch is tracked with strict provenance. Roll back any batch if unauthorized or erroneous.
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <FileSpreadsheet className="mx-auto mb-2 text-slate-600" size={32} />
            No import batches recorded yet. Upload a roster via Grassroots Onboarding.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="py-2.5 px-3">Batch ID</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Source & Category</th>
                  <th className="py-2.5 px-3">Imported / Duplicates</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {batches.map((batch) => {
                  const isRolledBack = batch.status === 'rolled_back';
                  return (
                    <tr key={batch.id} className="hover:bg-slate-950/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400 font-bold">{batch.batchId}</td>
                      <td className="py-2.5 px-3 text-white font-semibold flex items-center gap-1.5">
                        <FileSpreadsheet size={13} className="text-slate-400" />
                        {batch.fileName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="capitalize">{batch.source.replace(/_/g, ' ')}</span>
                        {batch.grassrootsCategory && (
                          <span className="text-[10px] text-slate-500 block">
                            {batch.grassrootsCategory.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">{batch.importedCount}</span> imported
                        <span className="text-slate-500"> • {batch.duplicateCount} dups</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(batch.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        {isRolledBack ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ROLLED BACK
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {!isRolledBack ? (
                          <button
                            onClick={() => setConfirmRollbackBatch(batch)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                          >
                            Rollback
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Restored</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Rollback */}
      {confirmRollbackBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <RotateCcw size={24} />
            </div>

            <h3 className="text-lg font-black text-white">Confirm Batch Rollback</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to roll back batch <strong className="text-white font-mono">{confirmRollbackBatch.batchId}</strong> ({confirmRollbackBatch.fileName})?
              This will safely remove all <strong>{confirmRollbackBatch.importedCount} genuine player profiles</strong> added in this batch.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmRollbackBatch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRollback}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-lg shadow-rose-600/30"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
