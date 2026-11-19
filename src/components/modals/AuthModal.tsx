// ============================================================
// FAN CLUB — Mobile & OTP Indian Cricket Login / Signup Flow
// Daytime-Optimized Light Theme with One-Tap Demo Access
// ============================================================
import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import type { User, UserRole } from '../../types/database';
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  User as UserIcon,
  LogOut,
  Trophy,
  Award,
  Radio,
  Flame,
  Check,
  MapPin
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

type AuthStep = 'phone' | 'otp' | 'profile' | 'profile_view';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const existingUser = db.getCurrentUser();
  const [step, setStep] = useState<AuthStep>(existingUser ? 'profile_view' : 'phone');

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(30);

  // New Profile state
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('match_scorer');
  const [city, setCity] = useState('Mumbai');
  const [existingMatchedUser, setExistingMatchedUser] = useState<User | null>(null);

  // Fast demo profiles
  const demoAccounts = [
    {
      name: 'Vikram Joshi',
      phone: '9811122334',
      role: 'match_scorer' as UserRole,
      roleLabel: 'Official Match Scorer',
      icon: '✍️',
      city: 'Mumbai',
    },
    {
      name: 'Rajesh Bhatti',
      phone: '9876543210',
      role: 'super_admin' as UserRole,
      roleLabel: 'Tournament Director',
      icon: '🏆',
      city: 'Mumbai',
    },
    {
      name: 'Aakash Verma',
      phone: '9822233445',
      role: 'team_manager' as UserRole,
      roleLabel: 'Team Captain (RSXI)',
      icon: '🏏',
      city: 'Mumbai',
    },
    {
      name: 'Rahul Sharma',
      phone: '9833344556',
      role: 'player' as UserRole,
      roleLabel: 'Grassroots Player',
      icon: '⚡',
      city: 'Mumbai',
    },
  ];

  // OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setPhoneError('');

    // Check if user already exists with this phone
    const foundUser = db.getUserByPhone(cleanNumber);
    if (foundUser) {
      setExistingMatchedUser(foundUser);
    } else {
      setExistingMatchedUser(null);
    }

    // Generate simulated OTP
    const newOtp = '123456';
    setGeneratedOtp(newOtp);
    setTimer(30);
    setOtp('');
    setOtpError('');
    setStep('otp');
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp && otp !== '123456') {
      setOtpError('Invalid OTP code. Please enter 123456 or tap Auto-Fill Demo OTP.');
      return;
    }
    setOtpError('');

    if (existingMatchedUser) {
      // Existing user: direct login
      db.setCurrentUser(existingMatchedUser);
      onSuccess(existingMatchedUser);
      onClose();
    } else {
      // New user: proceed to profile setup
      setStep('profile');
    }
  };

  // Handle Profile Submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: fullName.trim(),
      email: `${fullName.toLowerCase().replace(/\s+/g, '')}@fanclub.in`,
      phone: `+91 ${cleanNumber}`,
      city: city.trim() || 'Mumbai',
      role: selectedRole,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    db.addUser(newUser);
    db.setCurrentUser(newUser);
    onSuccess(newUser);
    onClose();
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = (demo: typeof demoAccounts[0]) => {
    const user: User = {
      id: `usr-${demo.phone}`,
      name: demo.name,
      email: `${demo.name.toLowerCase().replace(/\s+/g, '')}@fanclub.in`,
      phone: `+91 ${demo.phone}`,
      city: demo.city,
      role: demo.role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    db.addUser(user);
    db.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  // Handle Logout
  const handleLogout = () => {
    db.logoutUser();
    onSuccess(db.getCurrentUser());
    setStep('phone');
    setPhoneNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-900 p-6 sm:p-7 overflow-hidden">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20">
              FC
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                <span>Fan Club Cricket ID</span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'phone' && 'Sign in or register with Indian Mobile Number'}
                {step === 'otp' && 'Verify 6-digit OTP code'}
                {step === 'profile' && 'Complete your cricket profile'}
                {step === 'profile_view' && 'Active Fan Club Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── STEP: PROFILE VIEW (Already Logged In) ────────────────────── */}
        {step === 'profile_view' && existingUser && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {existingUser.name ? existingUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-slate-900 truncate">
                  {existingUser.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{existingUser.phone || existingUser.email}</span>
                  {existingUser.city && (
                    <span className="flex items-center gap-0.5 text-slate-400">
                      • <MapPin size={11} /> {existingUser.city}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} />
                    {existingUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setStep('phone')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Switch Account
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: PHONE NUMBER INPUT ───────────────────────────────── */}
        {step === 'phone' && (
          <div className="mt-5 space-y-5">
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all tracking-wider"
                    />
                    <Phone size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {phoneError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>Get OTP Verification Code</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Quick 1-Click Demo Profiles */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>⚡ 1-Click Instant Demo Login</span>
                <span className="text-emerald-600 font-bold text-[10px]">No OTP Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{acc.icon}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono border border-slate-200">
                        {acc.phone.slice(-4)}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {acc.roleLabel}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: OTP VERIFICATION ─────────────────────────────────── */}
        {step === 'otp' && (
          <div className="mt-5 space-y-5">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
              <Sparkles size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Demo Verification Code: <span className="font-mono text-sm underline text-emerald-800">123456</span></p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Code sent to +91 {phoneNumber}
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtp('123456')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Tap to Auto-Fill (123456)
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (otpError) setOtpError('');
                  }}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-xl font-black bg-slate-50 border border-slate-300 rounded-xl py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-mono"
                />
                {otpError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5">{otpError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>Verify OTP & Continue</span>
                <Check size={15} />
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="font-semibold text-slate-500 hover:text-slate-800"
                >
                  Change Number
                </button>
                {timer > 0 ? (
                  <span className="text-slate-400 font-medium">Resend OTP in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(30);
                      setOtp('123456');
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: NEW CRICKET PROFILE SETUP ────────────────────────── */}
        {step === 'profile' && (
          <div className="mt-5 space-y-4">
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Welcome! Since this is your first time, tell us your name and role for tomorrow&apos;s matches.
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sunil Gavaskar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Ground Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Surat, Delhi, Pune"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Primary Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'match_scorer', label: 'Match Scorer', desc: 'Live scoring & umpire logs', icon: '✍️' },
                    { id: 'super_admin', label: 'Tournament Director', desc: 'Schedule & prizes', icon: '🏆' },
                    { id: 'team_manager', label: 'Team Captain', desc: 'Squad & team line-up', icon: '🏏' },
                    { id: 'player', label: 'Cricket Player', desc: 'Stats & digital passport', icon: '⚡' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id as UserRole)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        selectedRole === r.id
                          ? 'border-emerald-500 bg-emerald-50/70 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-base mb-1">{r.icon}</div>
                      <div className="font-extrabold text-xs">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>Enter Fan Club Platform</span>
                <Check size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
