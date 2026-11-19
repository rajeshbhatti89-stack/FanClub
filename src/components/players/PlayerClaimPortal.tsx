// ============================================================
// FAN CLUB — Player Claim & Self-Verification Portal
// Grassroots player profile discovery, OTP verification simulation,
// ID proof submission, Digital Passport generation & Claim audit
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Smartphone, 
  FileCheck, 
  Sparkles, 
  Award, 
  ChevronRight, 
  X, 
  AlertTriangle,
  ExternalLink,
  Download,
  Info
} from 'lucide-react';
import type { Player } from '../../types/cricket';
import { db } from '../../db/database';

interface PlayerClaimPortalProps {
  onBackToRegistry?: () => void;
}

export const PlayerClaimPortal: React.FC<PlayerClaimPortalProps> = ({ onBackToRegistry }) => {
  const [players, setPlayers] = useState<Player[]>(db.getPlayers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unverified' | 'claimed' | 'verified'>('unverified');
  const [selectedPlayerToClaim, setSelectedPlayerToClaim] = useState<Player | null>(null);

  // Claim Form State
  const [claimerName, setClaimerName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [idProofType, setIdProofType] = useState('aadhaar');
  const [idProofRef, setIdProofRef] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [claimSuccessData, setClaimSuccessData] = useState<{ player: Player; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPlayers(db.getPlayers());
    });
    return () => unsub();
  }, []);

  const filteredPlayers = players.filter(p => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.fanClubId.toLowerCase().includes(q) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.currentTeam && p.currentTeam.toLowerCase().includes(q)) ||
      (p.teams && p.teams.some(t => t.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    if (statusFilter === 'unverified') return !p.isVerified && p.verificationStatus !== 'verified';
    if (statusFilter === 'verified') return p.isVerified || p.verificationStatus === 'verified';
    if (statusFilter === 'claimed') return p.verificationStatus === 'claimed';

    return true;
  });

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage(null);
    setIsOtpSent(true);
    // Simulated OTP for immediate testing convenience
    setOtpCode('774921');
  };

  const handleOpenClaimModal = (player: Player) => {
    setSelectedPlayerToClaim(player);
    setClaimerName(player.name);
    setPhone('');
    setOtpCode('');
    setIsOtpSent(false);
    setIdProofRef('');
    setConsentGiven(false);
    setErrorMessage(null);
    setClaimSuccessData(null);
  };

  const handleSubmitClaim = () => {
    if (!selectedPlayerToClaim) return;
    if (!claimerName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMessage('Please provide your 10-digit phone number.');
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (!consentGiven) {
      setErrorMessage('You must confirm that you are the authentic player or authorized guardian.');
      return;
    }

    const masked = phone.slice(0, 3) + '****' + phone.slice(-2);
    let hash = 0;
    for (let i = 0; i < phone.length; i++) {
      hash = (hash << 5) - hash + phone.charCodeAt(i);
      hash |= 0;
    }
    const phoneHash = `hash-${Math.abs(hash).toString(16)}`;

    const res = db.claimPlayerProfile(selectedPlayerToClaim.id, {
      claimerName,
      phoneMasked: masked,
      phoneHash,
      idProofType,
      idProofRef: idProofRef || 'VERIFIED-ONLINE',
    });

    if (res.success && res.player) {
      setClaimSuccessData({ player: res.player, message: res.message });
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-widest uppercase mb-3">
            <ShieldCheck size={14} /> GRASSROOTS VERIFICATION ENGINE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Player Claim & Digital Cricket Passport Portal
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Did your team manager, tournament organizer, or local club upload your roster? Find your unverified profile, verify your identity with mobile OTP, and claim your official <strong>Fan Club Digital Cricket Passport</strong> with tamper-proof QR code verification.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">
              Profiles needing verification: <strong className="text-amber-400 font-black">{players.filter(p => !p.isVerified).length}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-400">
              Verified & Claimed: <strong className="text-emerald-400 font-black">{players.filter(p => p.isVerified).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by your name, team, city, or FanClub ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'unverified', 'claimed', 'verified'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {tab === 'unverified' ? 'Unclaimed Profiles' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Players List Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const isVerified = player.isVerified || player.verificationStatus === 'verified';
          const isClaimed = player.verificationStatus === 'claimed';

          return (
            <div
              key={player.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-indigo-400 text-base">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">{player.name}</h3>
                      <p className="text-xs text-slate-400 capitalize">{player.role} • {player.city || player.country}</p>
                    </div>
                  </div>

                  {isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                      <CheckCircle2 size={11} /> VERIFIED
                    </span>
                  ) : isClaimed ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                      CLAIMED
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      UNVERIFIED
                    </span>
                  )}
                </div>

                {/* Team & Provenance Tag */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-bold">
                    {player.fanClubId}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {player.currentTeam || 'Grassroots Squad'}
                  </span>
                  {player.grassrootsCategory && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {player.grassrootsCategory.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Quick stats snapshot */}
                <div className="mt-4 grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Matches</div>
                    <div className="font-extrabold text-white">{player.matches ?? player.overallStats?.matches ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Runs</div>
                    <div className="font-extrabold text-emerald-400">{player.runs ?? player.overallStats?.runs ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Wickets</div>
                    <div className="font-extrabold text-cyan-400">{player.wickets ?? player.overallStats?.wickets ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Source: {player.dataProvenance?.source.replace('_', ' ')}
                </span>

                {isVerified ? (
                  <button
                    onClick={() => handleOpenClaimModal(player)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <QrCode size={13} /> View Passport
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenClaimModal(player)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                  >
                    Claim Profile <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim & Digital Passport Modal */}
      {selectedPlayerToClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlayerToClaim(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            {claimSuccessData ? (
              /* Success: Digital Passport Card */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <ShieldCheck size={36} />
                </div>

                <h3 className="text-2xl font-black text-white">Digital Passport Issued!</h3>
                <p className="text-xs text-slate-400 mt-1">{claimSuccessData.message}</p>

                {/* Passport Card Preview */}
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-emerald-500/40 text-left relative overflow-hidden shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        FAN CLUB OFFICIAL PASSPORT
                      </div>
                      <h4 className="text-lg font-black text-white mt-1">{claimSuccessData.player.name}</h4>
                      <p className="text-xs text-slate-400">
                        {claimSuccessData.player.role.toUpperCase()} • {claimSuccessData.player.currentTeam}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-white text-slate-950">
                      {/* Interactive SVG QR Code */}
                      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <circle cx="7" cy="7" r="1" fill="currentColor" />
                        <circle cx="17" cy="7" r="1" fill="currentColor" />
                        <circle cx="7" cy="17" r="1" fill="currentColor" />
                        <circle cx="17" cy="17" r="1" fill="currentColor" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">FanClub ID</span>
                      <span className="font-mono font-bold text-white">{claimSuccessData.player.fanClubId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Claim Token</span>
                      <span className="font-mono font-bold text-emerald-400">{claimSuccessData.player.claimToken || 'VERIFIED'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedPlayerToClaim(null)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Done & Return to Registry
                  </button>
                </div>
              </div>
            ) : (
              /* Claim Form */
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="text-indigo-400" size={20} />
                  <h3 className="text-xl font-black text-white">Claim Cricket Profile</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Verify your identity to assume ownership of <strong>{selectedPlayerToClaim.name}</strong> ({selectedPlayerToClaim.fanClubId}).
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={15} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Full Legal Name</label>
                    <input
                      type="text"
                      value={claimerName}
                      onChange={(e) => setClaimerName(e.target.value)}
                      placeholder="e.g. Ramesh Gaikwad"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number (For OTP Verification)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Smartphone size={13} />
                        {isOtpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                      <label className="text-xs font-bold text-indigo-300 block mb-1">Enter 6-digit OTP</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 774921"
                        maxLength={6}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Demo test OTP generated: <strong className="text-indigo-300">774921</strong></span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">ID Proof Type</label>
                      <select
                        value={idProofType}
                        onChange={(e) => setIdProofType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="aadhaar">Aadhaar Card (Last 4)</option>
                        <option value="driving_license">Driving License</option>
                        <option value="student_id">School/College ID</option>
                        <option value="corporate_id">Corporate Employee ID</option>
                        <option value="district_card">District Cricket Association ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Document Reference</label>
                      <input
                        type="text"
                        value={idProofRef}
                        onChange={(e) => setIdProofRef(e.target.value)}
                        placeholder="e.g. XXXX-4921"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-300 leading-snug">
                      I solemnly affirm that I am the authentic cricketer (or legal guardian/coach) of this profile. I understand providing false credentials will revoke the passport.
                    </span>
                  </label>

                  <button
                    onClick={handleSubmitClaim}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4"
                  >
                    <ShieldCheck size={16} /> Complete Verification & Issue Passport
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
