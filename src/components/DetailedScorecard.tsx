import React, { useState } from 'react';
import type { Match, PlanType, ThemeId } from '../types/cricket';
import { Share2, Printer } from 'lucide-react';

interface DetailedScorecardProps {
  match: Match;
  currentPlan: PlanType;
  currentTheme: ThemeId;
  onOpenPlans: () => void;
}

export const DetailedScorecard: React.FC<DetailedScorecardProps> = ({
  match,
  currentPlan,
  onOpenPlans,
}) => {
  const [activeInningTab, setActiveInningTab] = useState<0 | 1>(0);

  const selectedInning = match.innings[activeInningTab];
  const battingTeam = activeInningTab === 0 ? match.teamA : match.teamB;
  const bowlingTeam = activeInningTab === 0 ? match.teamB : match.teamA;

  // Did not bat players
  const battedIds = new Set(selectedInning.batsmen.map(b => b.playerId));
  const didNotBatPlayers = battingTeam.players.filter(p => !battedIds.has(p.id));

  const handlePrintOrExport = () => {
    if (currentPlan === 'free') {
      onOpenPlans();
      return;
    }
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🏏 *FanClub Match Scorecard* 🏏\n*${match.title}*\n${match.teamA.shortName}: ${match.innings[0].totalRuns}/${match.innings[0].wickets} (${match.innings[0].oversCompleted}.${match.innings[0].ballsInCurrentOver} ov)\n${match.teamB.shortName}: ${match.innings[1].totalRuns}/${match.innings[1].wickets} (${match.innings[1].oversCompleted}.${match.innings[1].ballsInCurrentOver} ov)\nLive on: fanclub.srijandev.in`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
      {/* Top Bar with Innings Selector & Export */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Innings Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveInningTab(0)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeInningTab === 0
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1st Innings: {match.teamA.shortName} ({match.innings[0].totalRuns}/{match.innings[0].wickets})
          </button>
          <button
            onClick={() => setActiveInningTab(1)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeInningTab === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2nd Innings: {match.teamB.shortName} ({match.innings[1].totalRuns}/{match.innings[1].wickets})
          </button>
        </div>

        {/* Share & Print Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Share</span>
          </button>
          <button
            onClick={handlePrintOrExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Scorecard</span>
            {currentPlan === 'free' && (
              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-bold">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Innings Content */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Batting Scorecard Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: battingTeam.color }} 
              />
              {battingTeam.name} Batting
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              Total: <strong>{selectedInning.totalRuns}/{selectedInning.wickets}</strong> ({selectedInning.oversCompleted}.{selectedInning.ballsInCurrentOver} Ov)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Batsman</th>
                  <th className="py-2.5 px-4">Dismissal</th>
                  <th className="py-2.5 px-3 text-right">R</th>
                  <th className="py-2.5 px-3 text-right">B</th>
                  <th className="py-2.5 px-3 text-right">4s</th>
                  <th className="py-2.5 px-3 text-right">6s</th>
                  <th className="py-2.5 px-4 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInning.batsmen.map((b) => (
                  <tr key={b.playerId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {b.name}
                      {!b.isOut && (
                        <span className="ml-1 text-emerald-600 font-black">*</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {b.isOut ? b.dismissal || 'out' : <span className="text-emerald-600 font-bold">not out</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                      {b.runs}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {b.balls}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {b.fours}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {b.sixes}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {b.strikeRate.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras summary */}
          <div className="flex items-center justify-between mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span>
              <strong>Extras:</strong> {selectedInning.extras.total} (wd {selectedInning.extras.wides}, nb {selectedInning.extras.noBalls}, b {selectedInning.extras.byes}, lb {selectedInning.extras.legByes})
            </span>
            <span>
              <strong>Total Score:</strong> {selectedInning.totalRuns}/{selectedInning.wickets} ({selectedInning.oversCompleted}.{selectedInning.ballsInCurrentOver} Ov)
            </span>
          </div>

          {/* Did Not Bat */}
          {didNotBatPlayers.length > 0 && (
            <div className="mt-3 text-xs text-slate-500">
              <span className="font-bold text-slate-700 mr-1.5">Yet to bat:</span>
              {didNotBatPlayers.map((p, idx) => (
                <span key={p.id} className="inline-block mr-2 text-slate-600">
                  {p.name}{idx < didNotBatPlayers.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bowling Scorecard Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: bowlingTeam.color }} 
              />
              {bowlingTeam.name} Bowling
            </h4>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Bowler</th>
                  <th className="py-2.5 px-3 text-right">O</th>
                  <th className="py-2.5 px-3 text-right">M</th>
                  <th className="py-2.5 px-3 text-right">R</th>
                  <th className="py-2.5 px-3 text-right">W</th>
                  <th className="py-2.5 px-3 text-right">Dots</th>
                  <th className="py-2.5 px-4 text-right">Econ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInning.bowlers.map((b) => (
                  <tr key={b.playerId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {b.name}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium">
                      {b.overs}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {b.maidens}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 font-bold">
                      {b.runsConceded}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-blue-700 text-sm">
                      {b.wickets}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {b.dots}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {b.economy.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
