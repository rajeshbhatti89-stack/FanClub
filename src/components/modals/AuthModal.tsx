// ============================================================
// FAN CLUB — User Authentication & Profile Modal
// ============================================================
import React, { useState } from 'react';
import { db } from '../../db/database';
import type { User, UserRole } from '../../types/database';
import { X, ShieldCheck, User as UserIcon, LogIn, Key, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('match_scorer');

  const demoAccounts = [
    { name: 'Rajesh Bhatti', email: 'rajesh@fanclub.in', role: 'super_admin' as UserRole, label: 'Super Admin (All Access)' },
    { name: 'Vikram Joshi', email: 'vikram.scorer@fanclub.in', role: 'match_scorer' as UserRole, label: 'Official Match Scorer' },
    { name: 'Aarav Patel', email: 'aarav@fanclub.in', role: 'fan' as UserRole, label: 'Cricket Fan (Community)' },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    const user: User = {
      id: `usr-${acc.role}`,
      name: acc.name,
      email: acc.email,
      role: acc.role,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    db.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const user: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@fanclub.in`,
      role,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    db.addUser(user);
    db.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              FC
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Fan Club Account</h3>
              <p className="text-[11px] text-slate-400">Sign in to score matches and manage clubs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Demo Fast Login */}
        <div className="mt-5 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fast One-Click Demo Access
          </div>
          {demoAccounts.map((acc, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectDemo(acc)}
              className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="font-extrabold text-xs text-white group-hover:text-emerald-400">
                  {acc.name}
                </div>
                <div className="text-[10px] text-slate-400">{acc.label}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                {acc.role}
              </span>
            </button>
          ))}
        </div>

        <div className="my-5 flex items-center gap-2 text-slate-600 text-xs font-bold">
          <div className="flex-1 border-t border-slate-800" />
          <span>OR CUSTOM PROFILE</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MS Dhoni"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white capitalize"
            >
              <option value="super_admin">Super Administrator</option>
              <option value="club_manager">Club / Team Manager</option>
              <option value="match_scorer">Match Scorer</option>
              <option value="streamer">OBS Streamer</option>
              <option value="player">Cricket Player</option>
              <option value="fan">Cricket Fan</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            Continue to Fan Club
          </button>
        </form>
      </div>
    </div>
  );
};
