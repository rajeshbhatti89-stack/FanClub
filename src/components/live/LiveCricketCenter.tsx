// ============================================================
// FAN CLUB — Worldwide Live Cricket Scores & Provider Hub
// Multi-provider aggregation: Sportmonks, CricketData, Highlightly, Local
// ============================================================
import React, { useState, useEffect } from 'react';
import type { Match } from '../../types/cricket';
import { db } from '../../db/database';
import { liveCricketService } from '../../services/liveCricketService';
import { 
  Radio, 
  Activity, 
  Tv, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Wifi, 
  RefreshCw, 
  Trophy, 
  Sparkles,
  Zap
} from 'lucide-react';

interface LiveCricketCenterProps {
  onSelectMatch: (match: Match) => void;
  onOpenObs: (match: Match) => void;
}

export const LiveCricketCenter: React.FC<LiveCricketCenterProps> = ({
  onSelectMatch,
  onOpenObs,
}) => {
  const [matches, setMatches] = useState<Match[]>(db.getMatches());
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const providers = db.getDataProviders();

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMatches(db.getMatches());
    });
    return () => unsub();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await liveCricketService.refreshAllProviders();
    setMatches(db.getMatches());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black tracking-widest uppercase mb-2">
            <Radio size={13} className="animate-pulse" /> LIVE CRICKET CENTER
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Worldwide Matches & Feeds</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global real-time scores, multi-provider sync (Sportmonks, CricketData, Highlightly), and local match scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-400' : ''} />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* Provider Latency Health Ribbon */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {providers.map((prov) => (
          <div key={prov.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-850">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Wifi size={12} className={prov.status === 'connected' ? 'text-emerald-400' : 'text-slate-500'} />
                {prov.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{prov.type}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {prov.latencyMs}ms
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2">
        {[
          { id: 'all', label: 'All Matches' },
          { id: 'live', label: 'Live Now', badge: matches.filter((m) => m.status === 'live').length },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-extrabold animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMatches.map((match) => {
          const inn1 = match.innings[0];
          const inn2 = match.innings[1];
          const isLive = match.status === 'live';

          return (
            <div
              key={match.id}
              className={`p-6 rounded-3xl bg-slate-900/90 border transition-all relative overflow-hidden ${
                isLive
                  ? 'border-emerald-500/40 shadow-xl shadow-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-extrabold uppercase text-[10px]">
                    {match.matchType || match.format || 'T20'}
                  </span>
                  <span className="text-slate-400 font-medium truncate max-w-[200px]">
                    {match.tournamentName || match.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse">
                      <Radio size={11} /> LIVE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      {match.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Teams & Live Score Display */}
              <div className="mt-4 space-y-3">
                {/* Team 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: (match.teamA || match.team1)?.color || '#0055A5' }}
                    />
                    <span className="font-extrabold text-base text-white">{(match.teamA || match.team1)?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      {inn1 ? `${inn1.totalRuns}/${inn1.wickets}` : '-'}
                    </span>
                    {inn1 && (
                      <span className="text-xs text-slate-400 font-mono ml-2">
                        ({inn1.oversCompleted}.{inn1.ballsInCurrentOver} ov)
                      </span>
                    )}
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: (match.teamB || match.team2)?.color || '#FF9933' }}
                    />
                    <span className="font-extrabold text-base text-white">{(match.teamB || match.team2)?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      {inn2 ? `${inn2.totalRuns}/${inn2.wickets}` : '-'}
                    </span>
                    {inn2 && (
                      <span className="text-xs text-slate-400 font-mono ml-2">
                        ({inn2.oversCompleted}.{inn2.ballsInCurrentOver} ov)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Note / Target equation */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs font-medium text-emerald-400">
                {match.resultSummary ||
                  (match.currentInnings === 2 && inn1
                    ? `Need ${inn1.totalRuns + 1 - (inn2?.totalRuns || 0)} runs to win`
                    : 'Match in progress')}
              </div>

              {/* Venue & Action Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                  <span className="truncate">{match.venue}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenObs(match)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                    title="OBS Stream Overlay"
                  >
                    <Tv size={14} />
                  </button>
                  <button
                    onClick={() => onSelectMatch(match)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
                  >
                    <span>Scorecard & Scoring</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
