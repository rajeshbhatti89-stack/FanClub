import React from 'react';
import type { Match } from '../types/cricket';
import { Info, MapPin, Calendar, Shield, Award, Users } from 'lucide-react';

interface MatchInfoProps {
  match: Match;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({ match }) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Info className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Match Information & Official Details</h3>
          <p className="text-xs text-slate-500">Official match sheet, playing conditions & officials</p>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Tournament / Series</span>
          <span className="font-bold text-slate-900 text-sm block">{match.title}</span>
          <span className="text-slate-500">{match.info.series} • {match.info.matchNumber}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Venue & Pitch</span>
          <span className="font-bold text-slate-900 text-sm block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {match.venue}
          </span>
          <span className="text-slate-500">{match.info.pitchCondition}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Toss Result</span>
          <span className="font-bold text-slate-900 text-sm block">
            {match.tossWinnerId === match.teamA.id ? match.teamA.name : match.teamB.name}
          </span>
          <span className="text-emerald-600 font-semibold capitalize">
            Elected to {match.tossDecision} first
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Match Format & Overs</span>
          <span className="font-bold text-slate-900 text-sm block">
            {match.matchType} ({match.overs} Overs per side)
          </span>
          <span className="text-slate-500">Max {match.maxOversPerBowler || 4} overs per bowler</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Ball Specifications</span>
          <span className="font-bold text-slate-900 text-sm block capitalize">
            {match.ballType.replace('_', ' ')}
          </span>
          <span className="text-slate-500">Official tournament certified</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Umpires & Scorer</span>
          <span className="font-bold text-slate-900 block truncate">
            {match.info.umpires.join(', ')}
          </span>
          <span className="text-slate-500">Scorer: {match.info.scorer}</span>
        </div>
      </div>

      {/* Squad Playing XI lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
        {/* Team A Squad */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: match.teamA.color }} />
            <h4 className="font-extrabold text-slate-900 text-sm">{match.teamA.name} Playing XI</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            {match.teamA.players.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60">
                <span className="font-semibold text-slate-800">
                  <strong className="text-slate-400 font-mono mr-2">{idx + 1}.</strong>
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">{p.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B Squad */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: match.teamB.color }} />
            <h4 className="font-extrabold text-slate-900 text-sm">{match.teamB.name} Playing XI</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            {match.teamB.players.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60">
                <span className="font-semibold text-slate-800">
                  <strong className="text-slate-400 font-mono mr-2">{idx + 1}.</strong>
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
