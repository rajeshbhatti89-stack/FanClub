// ============================================================
// FAN CLUB — Comprehensive Player Profile Modal
// Multi-format statistics (Test, ODI, T20I, IPL), Career & Digital ID
// ============================================================
import React, { useState } from 'react';
import type { Player, FormatStats } from '../../types/cricket';
import { DigitalCricketId } from '../branding/DigitalCricketId';
import { 
  X, 
  CheckCircle2, 
  Trophy, 
  Calendar, 
  MapPin, 
  Award, 
  QrCode, 
  BarChart2, 
  Share2, 
  TrendingUp,
  Shield
} from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onCompareWith?: (player: Player) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  onClose,
  onCompareWith,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'odi' | 't20i' | 'ipl' | 'passport'>('overview');

  const getStatsForTab = (tab: typeof activeTab): FormatStats => {
    switch (tab) {
      case 'test':
        return player.statsByFormat.test || player.overallStats;
      case 'odi':
        return player.statsByFormat.odi || player.overallStats;
      case 't20i':
        return player.statsByFormat.t20i || player.overallStats;
      case 'ipl':
        return player.statsByFormat.ipl || player.overallStats;
      default:
        return player.overallStats;
    }
  };

  const currentStats = getStatsForTab(activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-emerald-400">
                  {player.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{player.name}</h2>
                {player.isVerified && (
                  <span className="text-emerald-400" title="Verified Player Profile">
                    <CheckCircle2 size={18} />
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="capitalize font-semibold text-emerald-300">{player.role}</span>
                <span>•</span>
                <span>{player.battingStyle}</span>
                {player.bowlingStyle && (
                  <>
                    <span>•</span>
                    <span>{player.bowlingStyle}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {player.city ? `${player.city}, ` : ''}{player.country}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-emerald-400 font-bold">
                  {player.fanClubId}
                </span>
                {player.cricheroesId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-400">
                    CricHeroes: #{player.cricheroesId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCompareWith && (
              <button
                onClick={() => onCompareWith(player)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <TrendingUp size={13} /> Compare
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overall Career' },
            { id: 'test', label: 'Test Matches' },
            { id: 'odi', label: 'ODI Cricket' },
            { id: 't20i', label: 'T20 Internationals' },
            { id: 'ipl', label: 'IPL / T20 Leagues' },
            { id: 'passport', label: 'Digital Passport', icon: <QrCode size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'passport' ? (
            <div className="py-4">
              <DigitalCricketId player={player} />
            </div>
          ) : (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Matches / Inns</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.matches} <span className="text-xs text-slate-400 font-normal">({currentStats.innings})</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Runs</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">{currentStats.runs}</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Highest Score</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.highestScore}
                    {currentStats.highestScoreNotOut && <span className="text-emerald-400">*</span>}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Batting Avg</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    {currentStats.battingAverage.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Strike Rate</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.strikeRate.toFixed(1)}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">100s / 50s</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.hundreds} <span className="text-xs text-slate-400 font-normal">/ {currentStats.fifties}</span>
                  </div>
                </div>
              </div>

              {/* Bowling & Fielding Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Wickets</div>
                  <div className="text-xl font-black text-cyan-400 mt-0.5">{currentStats.wickets}</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Economy</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.bowlingEconomy > 0 ? currentStats.bowlingEconomy.toFixed(2) : '-'}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Best Bowling</div>
                  <div className="text-xl font-black text-white mt-0.5">{currentStats.bestBowling}</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Catches</div>
                  <div className="text-xl font-black text-white mt-0.5">{currentStats.catches}</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Run Outs</div>
                  <div className="text-xl font-black text-white mt-0.5">{currentStats.runOuts}</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Boundaries (4s / 6s)</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {currentStats.fours} <span className="text-xs text-slate-400 font-normal">/ {currentStats.sixes}</span>
                  </div>
                </div>
              </div>

              {/* Achievements & Milestones */}
              {player.achievements.length > 0 && (
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-3">
                    <Trophy size={15} className="text-amber-400" /> Career Honours & Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {player.achievements.map((ach) => (
                      <div key={ach.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Award size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{ach.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{ach.description}</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            {ach.tournament} • {ach.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Registrations & Clubs */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-3">
                  <Shield size={15} className="text-emerald-400" /> Affiliated Clubs & Squads
                </h4>
                <div className="flex flex-wrap gap-2">
                  {player.teams.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
