// ============================================================
// FAN CLUB — Original Brand Logo Component
// Dark Navy & Electric Green sports brand aesthetic
// ============================================================
import React from 'react';

interface FanClubLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const FanClubLogo: React.FC<FanClubLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Original Geometric Cricket Emblem */}
      <div className={`relative ${iconSize} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-1 flex items-center justify-center shadow-lg border border-emerald-500/30 group-hover:border-emerald-400 transition-all`}>
        {/* Electric Green Pulse Glow */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-sm -z-10" />

        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagonal Shield */}
          <polygon
            points="50,6 90,26 90,74 50,94 10,74 10,26"
            stroke="url(#greenGradient)"
            strokeWidth="5"
            fill="#0F172A"
          />
          {/* Cricket Stumps & Bails in Electric Green */}
          <rect x="38" y="32" width="5" height="38" rx="2" fill="#10B981" />
          <rect x="47.5" y="30" width="5" height="40" rx="2" fill="#34D399" />
          <rect x="57" y="32" width="5" height="38" rx="2" fill="#10B981" />
          {/* Bails */}
          <rect x="35" y="27" width="30" height="4" rx="2" fill="#F59E0B" />
          {/* Cricket Seam / Ball arc */}
          <path
            d="M20,68 Q50,42 80,68"
            stroke="#10B981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="2,3"
          />
          {/* Electric Spark / Star */}
          <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />

          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-slate-900 ${titleSize}`}>
            FAN
          </span>
          <span className={`font-black tracking-tight text-emerald-600 ${titleSize}`}>
            CLUB
          </span>
          <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-300">
            PRO
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Global Cricket Platform
          </span>
        )}
      </div>
    </div>
  );
};
