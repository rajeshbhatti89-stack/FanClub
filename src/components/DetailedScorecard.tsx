import React, { useState, useCallback } from 'react';
import {
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import type { Match, Inning, BatsmanInning, BowlerInning, FallOfWicket, Partnership, PlanType } from '../types/cricket';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DetailedScorecardProps {
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function oversDisplay(overs: number, balls: number): string {
  if (balls === 0) return `${overs}`;
  return `${overs}.${balls}`;
}

function formatOversStr(overs: number, balls: number): string {
  return balls > 0 ? `${overs}.${balls}` : `${overs}.0`;
}

function economyColor(econ: number): string {
  if (econ <= 6) return 'text-emerald-600 font-semibold';
  if (econ <= 9) return 'text-amber-500 font-semibold';
  return 'text-red-500 font-semibold';
}

function crr(inning: Inning): string {
  const totalBalls = inning.oversCompleted * 6 + inning.ballsInCurrentOver;
  if (totalBalls === 0) return '0.00';
  return ((inning.totalRuns / totalBalls) * 6).toFixed(2);
}

function rrr(inning: Inning, maxOvers: number): string | null {
  if (!inning.targetScore) return null;
  const totalBalls = maxOvers * 6;
  const ballsUsed = inning.oversCompleted * 6 + inning.ballsInCurrentOver;
  const remainingBalls = totalBalls - ballsUsed;
  if (remainingBalls <= 0) return null;
  const runsNeeded = inning.targetScore - inning.totalRuns;
  if (runsNeeded <= 0) return null;
  return ((runsNeeded / remainingBalls) * 6).toFixed(2);
}

function formatDismissal(b: BatsmanInning): string {
  if (!b.isOut) return '';
  if (b.dismissal) return b.dismissal;
  const type = b.dismissalType;
  if (!type) return 'dismissed';
  if (type === 'bowled') return `b ${b.bowlerName ?? ''}`;
  if (type === 'caught') return `c ${b.fielderName ?? ''} b ${b.bowlerName ?? ''}`;
  if (type === 'caught_behind') return `c †${b.fielderName ?? ''} b ${b.bowlerName ?? ''}`;
  if (type === 'caught_and_bowled') return `c & b ${b.bowlerName ?? ''}`;
  if (type === 'lbw') return `lbw b ${b.bowlerName ?? ''}`;
  if (type === 'run_out') return `run out (${b.fielderName ?? ''})`;
  if (type === 'stumped') return `st †${b.fielderName ?? ''} b ${b.bowlerName ?? ''}`;
  if (type === 'hit_wicket') return `hit wicket b ${b.bowlerName ?? ''}`;
  if (type === 'retired_hurt') return 'retired hurt';
  if (type === 'retired_out') return 'retired out';
  return type.replace(/_/g, ' ');
}

function buildWhatsAppText(match: Match, inningIdx: number): string {
  const inn = match.innings[inningIdx];
  const overs = formatOversStr(inn.oversCompleted, inn.ballsInCurrentOver);
  let text = `🏏 *${match.title}*\n`;
  text += `📍 ${match.venue}, ${match.city}\n\n`;
  text += `*${inn.teamName} - ${inn.totalRuns}/${inn.wickets} (${overs} ov)*\n\n`;
  text += `*BATTING*\n`;
  inn.batsmen
    .filter((b) => !b.didNotBat)
    .forEach((b) => {
      const dismissal = b.isOut ? formatDismissal(b) : 'not out';
      text += `${b.name} (${dismissal}) - ${b.runs}(${b.balls}) [4s:${b.fours} 6s:${b.sixes}]\n`;
    });
  text += `\nExtras: ${inn.extras.total} (w ${inn.extras.wides}, nb ${inn.extras.noBalls}, b ${inn.extras.byes}, lb ${inn.extras.legByes})\n`;
  text += `Total: ${inn.totalRuns}/${inn.wickets} (${overs} ov)\n\n`;
  text += `*BOWLING*\n`;
  inn.bowlers.forEach((bwl) => {
    const o = formatOversStr(bwl.overs, bwl.balls);
    text += `${bwl.name}: ${o}-${bwl.maidens}-${bwl.runsConceded}-${bwl.wickets} (Econ: ${bwl.economy.toFixed(2)})\n`;
  });
  if (inn.fallOfWickets.length > 0) {
    text += `\n*FOW*: `;
    text += inn.fallOfWickets.map((f) => `${f.wicketNumber}-${f.score} (${f.batsmanName}, ${f.overs}ov)`).join(', ');
    text += '\n';
  }
  text += `\n_Shared via FanClub Cricket Scorer_`;
  return text;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BattingTableProps {
  inning: Inning;
  isLive: boolean;
}

const BattingTable: React.FC<BattingTableProps> = ({ inning, isLive }) => {
  const activeBatsmen = inning.batsmen.filter((b) => !b.didNotBat);
  const dnb = inning.batsmen.filter((b) => b.didNotBat);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-500 uppercase tracking-wide">
            <th className="text-left py-2 px-3 font-semibold rounded-tl-lg min-w-[130px]">Batsman</th>
            <th className="text-left py-2 px-3 font-semibold text-slate-400 min-w-[160px]">Dismissal</th>
            <th className="text-center py-2 px-3 font-semibold w-10">R</th>
            <th className="text-center py-2 px-3 font-semibold w-10">B</th>
            <th className="text-center py-2 px-3 font-semibold w-10">4s</th>
            <th className="text-center py-2 px-3 font-semibold w-10">6s</th>
            <th className="text-center py-2 px-3 font-semibold w-14 rounded-tr-lg">SR</th>
          </tr>
        </thead>
        <tbody>
          {activeBatsmen.map((b, i) => {
            const isStriker = isLive && b.playerId === inning.currentStrikerId;
            const isNonStriker = isLive && b.playerId === inning.currentNonStrikerId;
            const isAtCrease = isStriker || isNonStriker;
            const dismissal = formatDismissal(b);

            return (
              <tr
                key={b.playerId}
                className={`border-b border-slate-100 transition-colors
                  ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  hover:bg-emerald-50/60
                  ${isAtCrease ? 'ring-1 ring-inset ring-emerald-200' : ''}`}
              >
                {/* Batsman */}
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    {isStriker && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                    {isNonStriker && (
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                    )}
                    {!isAtCrease && <span className="inline-block w-2 h-2 flex-shrink-0" />}
                    <span
                      className={`leading-tight
                        ${!b.isOut && isAtCrease ? 'font-bold text-slate-800' : ''}
                        ${b.isOut ? 'text-slate-600' : 'text-slate-800'}
                      `}
                    >
                      {b.name}
                      {isStriker ? '*' : ''}
                    </span>
                  </div>
                </td>
                {/* Dismissal */}
                <td className="py-2 px-3 max-w-[160px]">
                  {b.isOut ? (
                    <span className="italic text-slate-400 leading-tight line-clamp-2">{dismissal}</span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-100 text-[10px] font-semibold tracking-wide">
                      NOT OUT
                    </span>
                  )}
                </td>
                {/* Stats */}
                <td className={`text-center py-2 px-3 font-bold ${!b.isOut ? 'text-slate-800' : 'text-slate-600'}`}>
                  {b.runs}
                </td>
                <td className="text-center py-2 px-3 text-slate-500">{b.balls}</td>
                <td className="text-center py-2 px-3 text-slate-500">{b.fours}</td>
                <td className="text-center py-2 px-3 text-slate-500">{b.sixes}</td>
                <td className="text-center py-2 px-3 text-slate-500">{b.strikeRate.toFixed(1)}</td>
              </tr>
            );
          })}

          {/* Extras Row */}
          <tr className="bg-slate-100/80 border-b border-slate-200">
            <td className="py-2 px-3 font-semibold text-slate-600 text-[11px]">Extras</td>
            <td className="py-2 px-3 text-slate-500 text-[10px]" colSpan={5}>
              B: {inning.extras.byes} · LB: {inning.extras.legByes} · W: {inning.extras.wides} · NB:{' '}
              {inning.extras.noBalls} · P: {inning.extras.penalties}
            </td>
            <td className="text-center py-2 px-3 font-semibold text-slate-700">{inning.extras.total}</td>
          </tr>

          {/* Total Row */}
          <tr className="bg-slate-800 text-white">
            <td className="py-2.5 px-3 font-bold text-sm rounded-bl-lg" colSpan={2}>
              {inning.teamName}&nbsp;
              <span className="text-emerald-400">
                {inning.totalRuns}/{inning.wickets}
              </span>
              <span className="text-slate-400 font-normal text-xs ml-2">
                ({formatOversStr(inning.oversCompleted, inning.ballsInCurrentOver)} ov)
              </span>
            </td>
            <td className="text-center py-2.5 px-3 font-bold text-base" colSpan={5}>
              {inning.totalRuns}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Did Not Bat */}
      {dnb.length > 0 && (
        <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mr-2">Did Not Bat</span>
          <span className="text-xs text-slate-600">{dnb.map((b) => b.name).join(', ')}</span>
        </div>
      )}
    </div>
  );
};

// ─── Bowling Table ────────────────────────────────────────────────────────────

interface BowlingTableProps {
  inning: Inning;
  isLive: boolean;
}

const BowlingTable: React.FC<BowlingTableProps> = ({ inning, isLive }) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-700 text-slate-200 uppercase tracking-wide text-[10px]">
            <th className="text-left py-2 px-3 font-semibold rounded-tl-lg min-w-[120px]">Bowler</th>
            <th className="text-center py-2 px-3 w-10">O</th>
            <th className="text-center py-2 px-3 w-10">M</th>
            <th className="text-center py-2 px-3 w-10">R</th>
            <th className="text-center py-2 px-3 w-10">W</th>
            <th className="text-center py-2 px-3 w-14">Econ</th>
            <th className="text-center py-2 px-3 w-10">WD</th>
            <th className="text-center py-2 px-3 w-10">NB</th>
            <th className="text-center py-2 px-3 w-12 rounded-tr-lg">Dots</th>
          </tr>
        </thead>
        <tbody>
          {inning.bowlers.map((bwl, i) => {
            const isCurrent = isLive && bwl.playerId === inning.currentBowlerId;
            return (
              <tr
                key={bwl.playerId}
                className={`border-b border-slate-100 transition-colors
                  ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  hover:bg-blue-50/50
                  ${isCurrent ? 'ring-1 ring-inset ring-emerald-300' : ''}`}
              >
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                    {!isCurrent && <span className="inline-block w-2 h-2 flex-shrink-0" />}
                    <span className={`${isCurrent ? 'font-bold text-slate-800' : 'text-slate-700'}`}>
                      {bwl.name}
                    </span>
                  </div>
                </td>
                <td className="text-center py-2 px-3 text-slate-600">
                  {formatOversStr(bwl.overs, bwl.balls)}
                </td>
                <td className="text-center py-2 px-3 text-slate-500">{bwl.maidens}</td>
                <td className="text-center py-2 px-3 text-slate-600">{bwl.runsConceded}</td>
                <td className="text-center py-2 px-3 font-bold text-slate-800">{bwl.wickets}</td>
                <td className={`text-center py-2 px-3 ${economyColor(bwl.economy)}`}>
                  {bwl.economy.toFixed(2)}
                </td>
                <td className="text-center py-2 px-3 text-slate-500">{bwl.wides}</td>
                <td className="text-center py-2 px-3 text-slate-500">{bwl.noBalls}</td>
                <td className="text-center py-2 px-3 text-slate-500">{bwl.dots}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Fall of Wickets ──────────────────────────────────────────────────────────

interface FowSectionProps {
  wickets: FallOfWicket[];
}

const FowSection: React.FC<FowSectionProps> = ({ wickets }) => {
  if (wickets.length === 0) return null;
  return (
    <div className="mt-4 px-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Fall of Wickets</p>
      <div className="flex flex-wrap gap-1.5">
        {wickets.map((f) => (
          <span
            key={f.wicketNumber}
            className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-100 rounded-full text-[10px] text-red-700 font-medium"
          >
            <span className="font-bold">{f.wicketNumber}-{f.score}</span>
            <span className="text-red-400">·</span>
            <span>{f.batsmanName}</span>
            <span className="text-red-300">{f.overs}ov</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Partnership Bars ─────────────────────────────────────────────────────────

interface PartnershipBarsProps {
  partnerships: Partnership[];
}

const PartnershipBars: React.FC<PartnershipBarsProps> = ({ partnerships }) => {
  if (partnerships.length === 0) return null;
  const maxRuns = Math.max(...partnerships.map((p) => p.totalRuns), 1);

  return (
    <div className="mt-4 px-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Partnerships</p>
      <div className="space-y-2">
        {partnerships.map((p) => {
          const pct = Math.round((p.totalRuns / maxRuns) * 100);
          const b1pct = p.totalRuns > 0 ? Math.round((p.batsman1Runs / p.totalRuns) * 100) : 50;
          const b2pct = 100 - b1pct;

          return (
            <div key={p.wicketIndex} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 w-5 text-right flex-shrink-0">
                {p.wicketIndex}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-slate-600 truncate max-w-[80px]">{p.batsman1Name}</span>
                  <span className="text-[10px] font-bold text-slate-700">{p.totalRuns} ({p.totalBalls}b)</span>
                  <span className="text-[10px] text-slate-600 truncate max-w-[80px] text-right">{p.batsman2Name}</span>
                </div>
                {/* Bar */}
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex" style={{ width: '100%' }}>
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all"
                    style={{ width: `${(pct * b1pct) / 100}%` }}
                  />
                  <div
                    className="h-full bg-blue-400 rounded-r-full transition-all"
                    style={{ width: `${(pct * b2pct) / 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-emerald-600 font-semibold">{p.batsman1Runs}r</span>
                  <span className="text-[9px] text-blue-500 font-semibold">{p.batsman2Runs}r</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Match Stats Bar ──────────────────────────────────────────────────────────

interface MatchStatsBarProps {
  match: Match;
  inningIdx: number;
}

const MatchStatsBar: React.FC<MatchStatsBarProps> = ({ match, inningIdx }) => {
  const inn = match.innings[inningIdx];
  const isLive = match.status === 'live' && match.currentInningIndex === inningIdx;
  const crrVal = crr(inn);
  const rrrVal = rrr(inn, match.overs);
  const overs = formatOversStr(inn.oversCompleted, inn.ballsInCurrentOver);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
      <div className="flex items-center gap-1.5">
        <TrendingUp size={13} className="text-emerald-500" />
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">CRR</span>
        <span className="text-sm font-bold text-emerald-600">{crrVal}</span>
      </div>
      {rrrVal && isLive && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">RRR</span>
          <span className="text-sm font-bold text-red-500">{rrrVal}</span>
        </div>
      )}
      {inn.targetScore && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Target</span>
          <span className="text-sm font-bold text-blue-600">{inn.targetScore}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Overs</span>
        <span className="text-sm font-bold text-slate-700">{overs}</span>
      </div>
      {inn.targetScore && isLive && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Need</span>
          <span className="text-sm font-bold text-orange-500">
            {Math.max(0, inn.targetScore - inn.totalRuns)} off{' '}
            {Math.max(0, (match.overs * 6) - (inn.oversCompleted * 6 + inn.ballsInCurrentOver))}b
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DetailedScorecard: React.FC<DetailedScorecardProps> = ({ match, currentPlan: _currentPlan, onOpenPlans: _onOpenPlans }) => {
  const [selectedInning, setSelectedInning] = useState<0 | 1>(match.currentInningIndex);
  const [showPartnerships, setShowPartnerships] = useState(false);
  const [copied, setCopied] = useState(false);

  const inning = match.innings[selectedInning];
  const isLive = match.status === 'live';
  const isSelectedInningLive = isLive && match.currentInningIndex === selectedInning;

  const hasSecondInning =
    match.innings[1] &&
    (match.innings[1].batsmen.length > 0 || match.innings[1].totalRuns > 0);

  const handleWhatsAppShare = useCallback(() => {
    const text = buildWhatsAppText(match, selectedInning);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }, [match, selectedInning]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyText = useCallback(async () => {
    const text = buildWhatsAppText(match, selectedInning);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  }, [match, selectedInning]);

  const innTab = (idx: 0 | 1) => {
    const inn = match.innings[idx];
    const label = idx === 0 ? '1st' : '2nd';
    const overs = formatOversStr(inn.oversCompleted, inn.ballsInCurrentOver);
    return (
      <button
        key={idx}
        onClick={() => setSelectedInning(idx)}
        className={`flex-1 sm:flex-none px-3 py-2.5 text-xs font-semibold transition-all rounded-t-lg border-b-2
          ${selectedInning === idx
            ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
      >
        <span className="block text-[10px] font-normal text-slate-400 mb-0.5">{label} Innings</span>
        <span className="font-bold text-slate-700 leading-none">
          {inn.teamName.length > 12 ? inn.teamName.slice(0, 12) + '…' : inn.teamName}
        </span>
        <span className="ml-1 text-emerald-600 font-bold">
          {inn.totalRuns}/{inn.wickets}
        </span>
        <span className="ml-1 text-slate-400 font-normal">({overs})</span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden print:shadow-none print:rounded-none">
      {/* Header */}
      <div className="px-4 pt-4 pb-0 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">{match.title}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">{match.venue} · {match.city}</p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handleWhatsAppShare}
              title="Share on WhatsApp"
              className="flex items-center gap-1 px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-semibold transition-colors"
            >
              <MessageCircle size={12} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleCopyText}
              title="Copy scorecard text"
              className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print scorecard"
              className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors"
            >
              <Printer size={12} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Innings tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {innTab(0)}
          {hasSecondInning && innTab(1)}
        </div>
      </div>

      {/* Match Stats Bar */}
      <MatchStatsBar match={match} inningIdx={selectedInning} />

      {/* Body */}
      <div className="px-2 sm:px-4 py-4 space-y-5">
        {/* Batting Table */}
        <section>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-2">Batting</p>
          <BattingTable inning={inning} isLive={isSelectedInningLive} />
        </section>

        {/* Bowling Table */}
        {inning.bowlers.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-2">Bowling</p>
            <BowlingTable inning={inning} isLive={isSelectedInningLive} />
          </section>
        )}

        {/* Fall of Wickets */}
        {inning.fallOfWickets.length > 0 && (
          <section>
            <FowSection wickets={inning.fallOfWickets} />
          </section>
        )}

        {/* Partnerships */}
        {inning.partnerships.length > 0 && (
          <section>
            <button
              onClick={() => setShowPartnerships((p) => !p)}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-1 hover:text-slate-600 transition-colors"
            >
              Partnerships
              {showPartnerships ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showPartnerships && (
              <PartnershipBars partnerships={inning.partnerships} />
            )}
          </section>
        )}
      </div>

      {/* Toss / Match Result Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
        <span>
          <span className="font-semibold text-slate-500">Toss: </span>
          {match.meta.tossWinner} elected to {match.tossDecision}
        </span>
        {match.winDescription && (
          <span>
            <span className="font-semibold text-slate-500">Result: </span>
            {match.winDescription}
          </span>
        )}
        {match.meta.umpire1 && (
          <span>
            <span className="font-semibold text-slate-500">Umpire: </span>
            {match.meta.umpire1}{match.meta.umpire2 ? `, ${match.meta.umpire2}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default DetailedScorecard;
