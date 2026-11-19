// ============================================================
// FAN CLUB — Head-to-Head Player Comparison Modal
// ============================================================
import React from 'react';
import type { Player } from '../../types/cricket';
import { rankingAnalyticsService } from '../../services/rankingAnalytics';
import { X, Award, CheckCircle2, ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';

interface PlayerComparisonModalProps {
  playerA: Player;
  playerB: Player;
  onClose: () => void;
  onSelectAnotherA?: () => void;
  onSelectAnotherB?: () => void;
}

export const PlayerComparisonModal: React.FC<PlayerComparisonModalProps> = ({
  playerA,
  playerB,
  onClose,
}) => {
  const comp = rankingAnalyticsService.comparePlayers(playerA, playerB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            <h2 className="text-xl font-black text-white">Head-to-Head Player Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Players Top Showcase */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 gap-4">
          {/* Player A */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-lg flex-shrink-0">
              {playerA.avatar ? (
                <img src={playerA.avatar} alt={playerA.name} className="w-full h-full object-cover" />
              ) : (
                playerA.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{playerA.name}</h3>
              <p className="text-xs text-emerald-400 capitalize">{playerA.role} • {playerA.country}</p>
              <span className="text-[10px] font-mono text-slate-400">{playerA.fanClubId}</span>
            </div>
          </div>

          {/* Player B */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-400 text-lg flex-shrink-0">
              {playerB.avatar ? (
                <img src={playerB.avatar} alt={playerB.name} className="w-full h-full object-cover" />
              ) : (
                playerB.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{playerB.name}</h3>
              <p className="text-xs text-cyan-400 capitalize">{playerB.role} • {playerB.country}</p>
              <span className="text-[10px] font-mono text-slate-400">{playerB.fanClubId}</span>
            </div>
          </div>
        </div>

        {/* Comparison Metrics Table */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-3 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 text-center">
            <div className="text-left text-emerald-400">{playerA.name.split(' ')[0]}</div>
            <div className="text-slate-300">Metric</div>
            <div className="text-right text-cyan-400">{playerB.name.split(' ')[0]}</div>
          </div>

          {comp.metrics.map((m, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 items-center py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-850 text-xs"
            >
              {/* Player A Value */}
              <div
                className={`font-black text-left flex items-center gap-1.5 ${
                  m.advantage === 'A' ? 'text-emerald-400 font-extrabold' : 'text-slate-300'
                }`}
              >
                {m.advantage === 'A' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {m.valA}
              </div>

              {/* Metric Label */}
              <div className="text-center font-bold text-slate-400 text-[11px] uppercase tracking-wide">
                {m.label}
              </div>

              {/* Player B Value */}
              <div
                className={`font-black text-right flex items-center justify-end gap-1.5 ${
                  m.advantage === 'B' ? 'text-cyan-400 font-extrabold' : 'text-slate-300'
                }`}
              >
                {m.valB}
                {m.advantage === 'B' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </div>
            </div>
          ))}

          {/* Overall Comparison Verdict */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-950 to-cyan-500/10 border border-slate-800 text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              FAN CLUB ANALYTICS VERDICT
            </div>
            <div className="text-sm font-extrabold text-white mt-1">
              {comp.advantageA > comp.advantageB
                ? `⚡ ${playerA.name} leads in ${comp.advantageA} key statistical metrics`
                : comp.advantageB > comp.advantageA
                ? `⚡ ${playerB.name} leads in ${comp.advantageB} key statistical metrics`
                : '🤝 Balanced Matchup across primary cricket indicators'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
