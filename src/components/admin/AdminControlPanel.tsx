// ============================================================
// FAN CLUB — Master Administrator Control Panel
// User RBAC, Data Providers, Database Backup/Restore, Audit Logs
// ============================================================
import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import type { User, DataProviderRecord, AuditLogEntry, UserRole } from '../../types/database';
import { RealPlayerAcquisitionDashboard } from './RealPlayerAcquisitionDashboard';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  FileText, 
  Download, 
  Upload, 
  RotateCcw, 
  Wifi, 
  Activity, 
  CheckCircle2, 
  Crown,
  Key,
  Trash2,
  Plus
} from 'lucide-react';

export const AdminControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'acquisition' | 'users' | 'providers' | 'backup' | 'audit'>('acquisition');
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [providers, setProviders] = useState<DataProviderRecord[]>(db.getDataProviders());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(db.getAuditLogs());
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('match_scorer');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setUsers(db.getUsers());
      setProviders(db.getDataProviders());
      setAuditLogs(db.getAuditLogs());
    });
    return () => unsub();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserName.trim()) return;

    const u: User = {
      id: `usr-${Date.now()}`,
      email: newUserEmail.trim(),
      name: newUserName.trim(),
      role: newUserRole,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    db.addUser(u);
    setNewUserEmail('');
    setNewUserName('');
    alert(`Added user ${u.name} with role ${u.role}`);
  };

  const handleDownloadBackup = () => {
    const jsonStr = db.exportDatabaseBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fanclub_production_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const success = db.restoreDatabaseBackupJson(text);
        if (success) {
          alert('Database restored successfully from backup!');
        } else {
          alert('Failed to restore backup: Invalid database schema.');
        }
      } catch (err: any) {
        alert(`Failed to parse backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('Are you sure you want to reset all FanClub data to default seed data? All custom matches and players will be restored.')) {
      db.resetToFactorySeed();
      alert('FanClub database reset to factory seed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black tracking-widest uppercase mb-2">
            <Crown size={13} /> MASTER CONTROL SYSTEM
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin & Platform Governance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            RBAC user permissions, cricket API configurations, system audit logs, and persistent database snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
          >
            <Download size={13} /> Backup DB (JSON)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit flex-wrap">
        {[
          { id: 'acquisition', label: 'Acquisition & Provenance', icon: <ShieldCheck size={14} className="text-emerald-400" /> },
          { id: 'users', label: 'User RBAC', icon: <Users size={14} /> },
          { id: 'providers', label: 'Data Providers', icon: <Wifi size={14} /> },
          { id: 'backup', label: 'Backup & Restore', icon: <Database size={14} /> },
          { id: 'audit', label: 'Audit Trail', icon: <FileText size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Real Player Acquisition Dashboard */}
      {activeTab === 'acquisition' && (
        <div className="mt-6">
          <RealPlayerAcquisitionDashboard />
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-extrabold text-white text-base mb-4">Registered Platform Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-bold capitalize">{u.status}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-extrabold text-white text-base mb-3">Add User Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. rahul@cricket.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role & Permissions</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white capitalize"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="club_manager">Club Manager</option>
                  <option value="match_scorer">Match Scorer</option>
                  <option value="streamer">Streamer (OBS)</option>
                  <option value="player">Player</option>
                  <option value="fan">Fan</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-colors shadow-lg shadow-purple-600/20"
              >
                + Register Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Providers */}
      {activeTab === 'providers' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((prov) => (
            <div key={prov.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-emerald-400" />
                  <h4 className="font-extrabold text-white text-sm">{prov.name}</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-bold border border-slate-800">
                  {prov.latencyMs}ms Latency
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono truncate">{prov.endpointUrl}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
                <span>Last Polled: {prov.lastCheckedAt ? new Date(prov.lastCheckedAt).toLocaleTimeString() : 'Active'}</span>
                <span className="text-emerald-400 font-bold uppercase">{prov.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-base">Export Database Snapshot</h3>
            <p className="text-xs text-slate-400">
              Download the entire relational database (players, clubs, teams, matches, tournaments, OBS tokens) as an immutable JSON snapshot.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2"
            >
              <Download size={14} /> Download Full Backup JSON
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-white text-base">Restore Database Snapshot</h3>
            <p className="text-xs text-slate-400">
              Upload a previously exported FanClub JSON database snapshot to restore state.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>

          <div className="md:col-span-2 p-6 rounded-3xl bg-red-950/20 border border-red-500/30">
            <h4 className="font-extrabold text-red-400 text-sm">Danger Zone: Factory Database Reset</h4>
            <p className="text-xs text-slate-400 mt-1">
              Restores the database to initial production seed state (Virat Kohli, Rohit Sharma, Wankhede, Eden Gardens, India vs Australia WC Final).
            </p>
            <button
              onClick={handleFactoryReset}
              className="mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs"
            >
              Reset Database to Factory Seed
            </button>
          </div>
        </div>
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="font-extrabold text-white text-base mb-4">Immutable System Audit Trail</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between text-slate-500 text-[10px]">
                  <span className="text-purple-400 font-bold uppercase">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-300 mt-1">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
