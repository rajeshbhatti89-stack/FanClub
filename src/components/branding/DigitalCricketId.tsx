// ============================================================
// FAN CLUB — Digital Cricket ID & Player Passport
// High-tech digital pass with QR code, verified status, and stats
// ============================================================
import React, { useRef } from 'react';
import type { Player } from '../../types/cricket';
import { Shield, CheckCircle2, Award, QrCode, Download, Share2, Copy } from 'lucide-react';

interface DigitalCricketIdProps {
  player: Player;
  onClose?: () => void;
}

export const DigitalCricketId: React.FC<DigitalCricketIdProps> = ({ player, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const passportUrl = player.digitalPassportUrl || `https://fanclub.srijandev.in/player/${player.fanClubId}`;

  const copyPassportLink = () => {
    navigator.clipboard.writeText(passportUrl);
    alert(`Copied Digital Cricket ID link: ${passportUrl}`);
  };

  // Generate deterministic SVG QR code pattern based on player ID
  const generateQrBlocks = (seed: string) => {
    const blocks: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    for (let r = 0; r < 9; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < 9; c++) {
        // Corner markers
        if ((r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)) {
          const isBorder = r === 0 || r === 2 || r === 6 || r === 8 || c === 0 || c === 2 || c === 6 || c === 8;
          const isCenter = (r === 1 && c === 1) || (r === 1 && c === 7) || (r === 7 && c === 1);
          row.push(isBorder || isCenter);
        } else {
          const bit = (Math.abs(hash) >> ((r * 9 + c) % 31)) & 1;
          row.push(bit === 1);
        }
      }
      blocks.push(row);
    }
    return blocks;
  };

  const qrMatrix = generateQrBlocks(player.fanClubId);
  const stats = player.overallStats;

  return (
    <div className="bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-2xl max-w-md mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm">
            FC
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-widest text-emerald-400 uppercase">FAN CLUB PRO PASSPORT</h3>
            <p className="text-[10px] text-slate-400 tracking-wider">OFFICIAL CRICKET IDENTIFIER</p>
          </div>
        </div>
        {player.isVerified && (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} className="text-emerald-400" /> VERIFIED
          </span>
        )}
      </div>

      {/* ID Card Body */}
      <div
        ref={cardRef}
        className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 relative overflow-hidden shadow-inner"
      >
        {/* Hologram stripe */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-400/60 shadow-lg bg-slate-800 flex items-center justify-center">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-emerald-400">
                  {player.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {player.jerseyNumber && (
              <span className="absolute -bottom-2 -right-2 bg-slate-950 text-emerald-400 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-500/40">
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-black text-lg text-white truncate">{player.name}</h4>
            <p className="text-xs text-slate-300 capitalize">{player.role} • {player.battingStyle}</p>
            {player.bowlingStyle && (
              <p className="text-[11px] text-slate-400 truncate">{player.bowlingStyle}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/70 border border-slate-700 text-emerald-400 font-bold">
                {player.fanClubId}
              </span>
              <span className="text-[11px] text-slate-400">{player.country}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-4 gap-2 py-3 border-y border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Matches</div>
            <div className="text-sm font-black text-white">{stats.matches}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Runs</div>
            <div className="text-sm font-black text-emerald-400">{stats.runs}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Wickets</div>
            <div className="text-sm font-black text-cyan-400">{stats.wickets}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Avg / SR</div>
            <div className="text-sm font-black text-white">{stats.battingAverage.toFixed(1)}</div>
          </div>
        </div>

        {/* QR Code and provenance */}
        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">DATA PROVENANCE</div>
            <div className="text-[11px] font-semibold text-slate-200 capitalize">
              Source: <span className="text-emerald-400">{player.dataProvenance?.source || 'Verified'}</span>
            </div>
            {player.cricheroesId && (
              <div className="text-[10px] font-mono text-slate-400">
                CricHeroes Ref: #{player.cricheroesId}
              </div>
            )}
            <div className="text-[9px] text-slate-500">
              FanClub Global Cricket Identity Node
            </div>
          </div>

          {/* SVG QR Code */}
          <div className="p-2 bg-white rounded-xl shadow-md">
            <svg viewBox="0 0 9 9" className="w-16 h-16 shape-rendering-crispEdges">
              {qrMatrix.map((row, r) =>
                row.map((active, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill={active ? '#020617' : '#FFFFFF'}
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={copyPassportLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Copy size={13} /> Copy Passport Link
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
