// ============================================================
// FAN CLUB — Worldwide Live Cricket Scores & Provider Hub
// Daytime Light Theme with Multi-Provider Aggregation
// ============================================================
import React, { useState, useEffect } from 'react';
import type { Match } from '../../types/cricket';
import { db } from '../../db/database';
import { liveCricketService } from '../../services/liveCricketService';
import { 
  Radio, 
  Tv, 
  MapPin, 
  ChevronRight, 
  Wifi, 
  RefreshCw, 
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
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-900">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black tracking-widest uppercase mb-2">
            <Radio size={13} className="animate-pulse" /> LIVE CRICKET CENTER
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Worldwide Matches & Feeds</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global real-time scores, multi-provider sync (Sportmonks, CricketData, Highlightly), and local match scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* Provider Latency Health Ribbon */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
        {providers.map((prov) => (
          <div key={prov.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Wifi size={12} className={prov.status === 'connected' ? 'text-emerald-600' : 'text-slate-400'} />
                {prov.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{prov.type}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
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
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-extrabold animate-pulse">
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
              className={`p-6 rounded-3xl bg-white border transition-all relative overflow-hidden shadow-sm ${
                isLive
                  ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow'
              }`}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-extrabold uppercase text-[10px]">
                    {match.matchType || (match as any).format || 'T20'}
                  </span>
                  <span className="text-slate-600 font-bold truncate max-w-[200px]">
                    {(match as any).tournamentName || match.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-rose-700 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 animate-pulse">
                      <Radio size={11} /> LIVE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
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
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: (match.teamA || (match as any).team1)?.color || '#0055A5' }}
                    />
                    <span className="font-extrabold text-base text-slate-900">{(match.teamA || (match as any).team1)?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">
                      {inn1 ? `${inn1.totalRuns}/${inn1.wickets}` : '-'}
                    </span>
                    {inn1 && (
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        ({inn1.oversCompleted}.{inn1.ballsInCurrentOver} ov)
                      </span>
                    )}
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: (match.teamB || (match as any).team2)?.color || '#FF9933' }}
                    />
                    <span className="font-extrabold text-base text-slate-900">{(match.teamB || (match as any).team2)?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">
                      {inn2 ? `${inn2.totalRuns}/${inn2.wickets}` : '-'}
                    </span>
                    {inn2 && (
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        ({inn2.oversCompleted}.{inn2.ballsInCurrentOver} ov)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Note / Target equation */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-emerald-800">
                {(match as any).resultSummary ||
                  (match.currentInningIndex === 1 && inn1
                    ? `Need ${inn1.totalRuns + 1 - (inn2?.totalRuns || 0)} runs to win`
                    : 'Match in progress')}
              </div>

              {/* Venue & Action Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{match.venue}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenObs(match)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                    title="OBS Stream Overlay"
                  >
                    <Tv size={14} />
                  </button>
                  <button
                    onClick={() => onSelectMatch(match)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors shadow-sm"
                  >
                    <span>Scoring Pad</span>
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
