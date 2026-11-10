import React from 'react';
import type { Match } from '../types/cricket';
import { MapPin, Calendar, Clock, Users, Info, Shield, Award, Cloud, Wind } from 'lucide-react';

interface MatchInfoProps {
  match: Match;
}

const InfoRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-slate-400">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value || '—'}</div>
    </div>
  </div>
);

export const MatchInfo: React.FC<MatchInfoProps> = ({ match }) => {
  const tossDesc = `${match.meta.tossWinner} won the toss and elected to ${match.meta.tossDecision} first`;

  return (
    <div className="space-y-5">
      {/* Match Header */}
      <div
        className="rounded-3xl overflow-hidden shadow-md"
        style={{
          background: `linear-gradient(135deg, ${match.teamA.color}22, #FFFFFF 60%, ${match.teamB.color}22)`,
          borderLeft: `6px solid ${match.teamA.color}`,
          borderRight: `6px solid ${match.teamB.color}`,
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-black text-slate-900 mb-1">{match.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {match.venue}{match.city ? `, ${match.city}` : ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {match.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {match.startTime}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {match.matchType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {match.overs} Overs
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 capitalize">
              {match.ballType.replace('_', ' ')} Ball
            </span>
            {match.meta.dls && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                DLS Applied
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Match Officials */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Match Officials
          </h3>
          <InfoRow label="On-Field Umpire 1" value={match.meta.umpire1} icon={<Users className="w-4 h-4" />} />
          <InfoRow label="On-Field Umpire 2" value={match.meta.umpire2} icon={<Users className="w-4 h-4" />} />
          <InfoRow label="Third Umpire" value={match.meta.thirdUmpire} icon={<Users className="w-4 h-4" />} />
          <InfoRow label="Match Referee" value={match.meta.referee} icon={<Shield className="w-4 h-4" />} />
          <InfoRow label="Official Scorer" value={match.meta.scorer} icon={<Award className="w-4 h-4" />} />
        </div>

        {/* Match Conditions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-500" />
            Playing Conditions
          </h3>
          <InfoRow label="Toss" value={tossDesc} icon={<Award className="w-4 h-4" />} />
          <InfoRow label="Pitch Condition" value={match.meta.pitchCondition} icon={<Info className="w-4 h-4" />} />
          <InfoRow label="Weather" value={match.meta.weatherCondition} icon={<Wind className="w-4 h-4" />} />
          <InfoRow label="Max Overs/Bowler" value={`${match.maxOversPerBowler} overs`} icon={<Info className="w-4 h-4" />} />
          {match.meta.series && (
            <InfoRow label="Series / Tournament" value={match.meta.series} icon={<Award className="w-4 h-4" />} />
          )}
          {match.meta.matchNumber && (
            <InfoRow label="Match Number" value={match.meta.matchNumber} icon={<Info className="w-4 h-4" />} />
          )}
        </div>
      </div>

      {/* Playing XI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[match.teamA, match.teamB].map((team) => (
          <div key={team.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                  style={{ backgroundColor: team.color }}
                >
                  {team.shortName}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{team.name}</h3>
                <div className="text-xs text-slate-500">{team.players.length} players</div>
              </div>
            </div>
            {team.players.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">No players added yet</div>
            ) : (
              <ol className="space-y-1.5">
                {team.players.map((player, idx) => {
                  const isCaptain = team.captain === player.id;
                  const isWK = team.wicketkeeper === player.id;
                  return (
                    <li key={player.id} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-4 text-right font-mono font-bold">{idx + 1}</span>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] text-white shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {player.name.charAt(0)}
                      </span>
                      <span className="font-semibold text-slate-800 flex-1">{player.name}</span>
                      {isCaptain && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1 rounded">C</span>
                      )}
                      {isWK && (
                        <span className="text-[9px] font-black bg-sky-100 text-sky-800 px-1 rounded">WK</span>
                      )}
                      <span className="text-[9px] text-slate-400 capitalize">{player.role}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

