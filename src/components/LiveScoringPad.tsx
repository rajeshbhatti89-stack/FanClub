import { useState, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  RefreshCw,
  ChevronDown,
  Zap,
  X,
  Check,
  User,
  AlertTriangle,
} from 'lucide-react';
import type { Match, PlanType, ExtraType, WicketType, BatsmanInning, BowlerInning, BallRecord } from '../types/cricket';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveScoringPadProps {
  match: Match;
  currentPlan: PlanType;
  onRecordBall: (
    runsOffBat: number,
    extraRuns: number,
    extraType: ExtraType,
    isWicket: boolean,
    wicketType?: WicketType,
    newBatsmanId?: string,
    dismissedId?: string,
    wagonDirection?: string,
    isLofted?: boolean,
    fielderName?: string
  ) => void;
  onUndoLastBall: () => void;
  onSwapStrike: () => void;
  onChangeBowler: (bowlerId: string) => void;
  onOpenPlans: () => void;
  onInningsBreak: () => void;
}

type WagonZone =
  | 'cover'
  | 'mid_on'
  | 'mid_off'
  | 'square_leg'
  | 'fine_leg'
  | 'long_on'
  | 'long_off'
  | 'third_man';

type ShotType = 'ground' | 'lofted';

interface WicketModalState {
  wicketType: WicketType;
  dismissedId: string;
  fielderName: string;
  incomingBatsmanId: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WICKET_TYPE_LABELS: Record<WicketType, string> = {
  bowled: 'Bowled',
  caught: 'Caught',
  caught_behind: 'Caught Behind',
  caught_and_bowled: 'Caught & Bowled',
  lbw: 'LBW',
  run_out: 'Run Out',
  stumped: 'Stumped',
  hit_wicket: 'Hit Wicket',
  retired_hurt: 'Retired Hurt',
  retired_out: 'Retired Out',
  obstructing_field: 'Obstructing the Field',
  timed_out: 'Timed Out',
};

const ALL_WICKET_TYPES: WicketType[] = [
  'bowled',
  'caught',
  'caught_behind',
  'caught_and_bowled',
  'lbw',
  'run_out',
  'stumped',
  'hit_wicket',
  'retired_hurt',
  'retired_out',
  'obstructing_field',
  'timed_out',
];

const FIELDER_REQUIRED: WicketType[] = ['caught', 'caught_behind', 'run_out'];

const WAGON_ZONES: { zone: WagonZone; label: string; angle: number }[] = [
  { zone: 'third_man', label: 'Third Man', angle: 315 },
  { zone: 'cover', label: 'Cover', angle: 45 },
  { zone: 'mid_off', label: 'Mid Off', angle: 90 },
  { zone: 'long_off', label: 'Long Off', angle: 112 },
  { zone: 'long_on', label: 'Long On', angle: 68 },
  { zone: 'mid_on', label: 'Mid On', angle: 270 },
  { zone: 'fine_leg', label: 'Fine Leg', angle: 225 },
  { zone: 'square_leg', label: 'Square Leg', angle: 180 },
];

const EXTRA_TABS: { type: ExtraType; label: string }[] = [
  { type: 'wide', label: 'Wide' },
  { type: 'no_ball', label: 'No Ball' },
  { type: 'bye', label: 'Bye' },
  { type: 'leg_bye', label: 'Leg Bye' },
  { type: 'penalty', label: 'Penalty' },
];

// ─── Helper: format overs ─────────────────────────────────────────────────────

function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`;
}

// ─── Helper: get ball dot color class ─────────────────────────────────────────

function getBallDotClass(ball: BallRecord): string {
  if (ball.isWicket) return 'bg-red-500 text-white';
  if (ball.extraType === 'wide') return 'bg-amber-400 text-black';
  if (ball.extraType === 'no_ball') return 'bg-orange-500 text-white ring-2 ring-orange-300';
  if (ball.runsOffBat === 6) return 'bg-orange-500 text-white';
  if (ball.runsOffBat === 4) return 'bg-blue-600 text-white';
  if (ball.runsOffBat >= 1 && ball.runsOffBat <= 3) return 'bg-emerald-500 text-white';
  return 'bg-slate-300 text-slate-700';
}

function getBallDotLabel(ball: BallRecord): string {
  if (ball.isWicket) return 'W';
  if (ball.extraType === 'wide') return 'Wd';
  if (ball.extraType === 'no_ball') return 'NB';
  const total = ball.runsOffBat + ball.extraRuns;
  return String(total);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BallDotProps {
  ball: BallRecord;
}

function BallDot({ ball }: BallDotProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getBallDotClass(ball)}`}
    >
      {getBallDotLabel(ball)}
    </div>
  );
}

// ─── Wagon Wheel SVG ──────────────────────────────────────────────────────────

interface WagonWheelProps {
  selected: WagonZone | null;
  onSelect: (zone: WagonZone) => void;
}

function WagonWheel({ selected, onSelect }: WagonWheelProps) {
  // 8 pie sectors centred on a 200×200 SVG circle
  const cx = 100;
  const cy = 100;
  const r = 90;
  const innerR = 28;
  const sectors = 8;
  const sweep = (2 * Math.PI) / sectors;

  // Ordered zones clockwise from top
  const ordered: WagonZone[] = [
    'mid_off',
    'cover',
    'third_man',
    'fine_leg',
    'square_leg',
    'mid_on',
    'long_on',
    'long_off',
  ];

  const shortLabels: Record<WagonZone, string> = {
    mid_off: 'Mid Off',
    cover: 'Cover',
    third_man: '3rd Man',
    fine_leg: 'Fine Leg',
    square_leg: 'Sq Leg',
    mid_on: 'Mid On',
    long_on: 'Long On',
    long_off: 'Long Off',
  };

  function sectorPath(index: number): string {
    const startAngle = (index * sweep) - Math.PI / 2 - sweep / 2;
    const endAngle = startAngle + sweep;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    return `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1} Z`;
  }

  function labelPos(index: number): { x: number; y: number } {
    const midAngle = (index * sweep) - Math.PI / 2;
    const labelR = (r + innerR) / 2 + 5;
    return {
      x: cx + labelR * Math.cos(midAngle),
      y: cy + labelR * Math.sin(midAngle),
    };
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto select-none">
      {/* Outfield circle */}
      <circle cx={cx} cy={cy} r={r} fill="#d1fae5" stroke="#6ee7b7" strokeWidth={1} />
      {/* Inner circle (pitch) */}
      <ellipse cx={cx} cy={cy} rx={12} ry={22} fill="#fef9c3" stroke="#fde68a" strokeWidth={1} />
      {/* Sectors */}
      {ordered.map((zone, i) => {
        const isSelected = selected === zone;
        return (
          <path
            key={zone}
            d={sectorPath(i)}
            fill={isSelected ? '#2563eb' : '#bbf7d0'}
            fillOpacity={isSelected ? 0.95 : 0.6}
            stroke={isSelected ? '#1d4ed8' : '#86efac'}
            strokeWidth={isSelected ? 2 : 1}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
            onClick={() => onSelect(zone)}
          />
        );
      })}
      {/* Labels */}
      {ordered.map((zone, i) => {
        const pos = labelPos(i);
        const isSelected = selected === zone;
        return (
          <text
            key={`lbl-${zone}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={7}
            fontWeight={isSelected ? 'bold' : 'normal'}
            fill={isSelected ? '#1d4ed8' : '#065f46'}
            className="pointer-events-none"
          >
            {shortLabels[zone]}
          </text>
        );
      })}
      {/* Centre stumps icon */}
      <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20} stroke="#78350f" strokeWidth={2} />
      <line x1={cx - 4} y1={cy - 20} x2={cx - 4} y2={cy + 20} stroke="#78350f" strokeWidth={1.5} />
      <line x1={cx + 4} y1={cy - 20} x2={cx + 4} y2={cy + 20} stroke="#78350f" strokeWidth={1.5} />
    </svg>
  );
}

// ─── Wicket Modal ─────────────────────────────────────────────────────────────

interface WicketModalProps {
  strikerId: string;
  nonStrikerId: string;
  batsmen: BatsmanInning[];
  availableBatsmen: BatsmanInning[];
  state: WicketModalState;
  onChange: (s: WicketModalState) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function WicketModal({
  strikerId,
  nonStrikerId,
  batsmen,
  availableBatsmen,
  state,
  onChange,
  onConfirm,
  onCancel,
}: WicketModalProps) {
  const striker = batsmen.find((b) => b.playerId === strikerId);
  const nonStriker = batsmen.find((b) => b.playerId === nonStrikerId);
  const needsFielder = FIELDER_REQUIRED.includes(state.wicketType);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Wicket</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Wicket Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Wicket Type
          </label>
          <div className="relative">
            <select
              value={state.wicketType}
              onChange={(e) =>
                onChange({ ...state, wicketType: e.target.value as WicketType })
              }
              className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400 pr-10"
            >
              {ALL_WICKET_TYPES.map((wt) => (
                <option key={wt} value={wt}>
                  {WICKET_TYPE_LABELS[wt]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Dismissed Batsman */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Dismissed Batsman
          </label>
          <div className="flex gap-2">
            {striker && (
              <button
                onClick={() => onChange({ ...state, dismissedId: striker.playerId })}
                className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  state.dismissedId === striker.playerId
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs text-slate-400 block">Striker</span>
                {striker.name}
              </button>
            )}
            {nonStriker && state.wicketType === 'run_out' && (
              <button
                onClick={() => onChange({ ...state, dismissedId: nonStriker.playerId })}
                className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  state.dismissedId === nonStriker.playerId
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs text-slate-400 block">Non-Striker</span>
                {nonStriker.name}
              </button>
            )}
          </div>
        </div>

        {/* Fielder Name */}
        {needsFielder && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Fielder Name
            </label>
            <input
              type="text"
              placeholder="Enter fielder name"
              value={state.fielderName}
              onChange={(e) => onChange({ ...state, fielderName: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-3 text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Incoming Batsman */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Incoming Batsman
          </label>
          <div className="relative">
            <select
              value={state.incomingBatsmanId}
              onChange={(e) => onChange({ ...state, incomingBatsmanId: e.target.value })}
              className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400 pr-10"
            >
              <option value="">— Select player —</option>
              {availableBatsmen.map((b) => (
                <option key={b.playerId} value={b.playerId}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!state.incomingBatsmanId && availableBatsmen.length > 0}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Bowler Modal ──────────────────────────────────────────────────────

interface ChangeBowlerModalProps {
  currentBowlerId: string;
  bowlers: BowlerInning[];
  bowlingTeamPlayers: { id: string; name: string }[];
  maxOversPerBowler: number;
  totalOvers: number;
  onConfirm: (bowlerId: string) => void;
  onCancel: () => void;
}

function ChangeBowlerModal({
  currentBowlerId,
  bowlers,
  bowlingTeamPlayers,
  maxOversPerBowler,
  totalOvers,
  onConfirm,
  onCancel,
}: ChangeBowlerModalProps) {
  const [selectedId, setSelectedId] = useState('');

  function getBowlerStats(playerId: string): BowlerInning | undefined {
    return bowlers.find((b) => b.playerId === playerId);
  }

  const eligiblePlayers = bowlingTeamPlayers.filter((p) => {
    if (p.id === currentBowlerId) return false;
    const stats = getBowlerStats(p.id);
    if (!stats) return true;
    return stats.overs < maxOversPerBowler;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Change Bowler</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Max {maxOversPerBowler} overs per bowler · Match: {totalOvers} overs
        </p>

        {/* Player List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {eligiblePlayers.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6">
              No eligible bowlers available
            </p>
          )}
          {eligiblePlayers.map((player) => {
            const stats = getBowlerStats(player.id);
            const isSelected = selectedId === player.id;
            return (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="font-semibold text-slate-900">{player.name}</span>
                </div>
                {stats ? (
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-700">
                      {stats.overs}.{stats.balls} ov
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {stats.runsConceded}R · {stats.wickets}W
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedId && onConfirm(selectedId)}
            disabled={!selectedId}
            className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiveScoringPad({
  match,
  currentPlan,
  onRecordBall,
  onUndoLastBall,
  onSwapStrike,
  onChangeBowler,
  onOpenPlans,
  onInningsBreak,
}: LiveScoringPadProps) {
  const inning = match.innings[match.currentInningIndex];
  const battingTeam =
    match.teamA.id === inning.teamId ? match.teamA : match.teamB;
  const bowlingTeam =
    match.teamA.id === inning.teamId ? match.teamB : match.teamA;

  // ── Derived state ──────────────────────────────────────────────────────────

  const striker = useMemo(
    () => inning.batsmen.find((b) => b.playerId === inning.currentStrikerId),
    [inning]
  );
  const nonStriker = useMemo(
    () => inning.batsmen.find((b) => b.playerId === inning.currentNonStrikerId),
    [inning]
  );
  const currentBowler = useMemo(
    () => inning.bowlers.find((b) => b.playerId === inning.currentBowlerId),
    [inning]
  );

  const currentOverBalls = useMemo(
    () =>
      inning.balls.filter(
        (b) => b.overIndex === inning.oversCompleted && b.isLegalBall
      ),
    [inning]
  );

  const last5OversData = useMemo(() => {
    const overs: BallRecord[][] = [];
    const startOver = Math.max(0, inning.oversCompleted - 4);
    for (let o = startOver; o < inning.oversCompleted; o++) {
      overs.push(inning.balls.filter((b) => b.overIndex === o));
    }
    return overs;
  }, [inning]);

  // Available (not yet out) batting team players not on crease
  const availableIncomingBatsmen = useMemo(() => {
    const activePids = new Set([inning.currentStrikerId, inning.currentNonStrikerId]);
    return inning.batsmen.filter(
      (b) => !b.isOut && !activePids.has(b.playerId) && !b.didNotBat === false
    ).concat(
      inning.batsmen.filter((b) => b.didNotBat && !activePids.has(b.playerId))
    );
  }, [inning]);

  const bowlingTeamPlayers = useMemo(
    () => bowlingTeam.players.map((p) => ({ id: p.id, name: p.name })),
    [bowlingTeam]
  );

  // ── Local UI state ─────────────────────────────────────────────────────────

  const [selectedExtra, setSelectedExtra] = useState<ExtraType>('none');
  const [selectedZone, setSelectedZone] = useState<WagonZone | null>(null);
  const [shotType, setShotType] = useState<ShotType>('ground');
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [pendingRuns, setPendingRuns] = useState<number | null>(null);

  const [wicketState, setWicketState] = useState<WicketModalState>({
    wicketType: 'bowled',
    dismissedId: inning.currentStrikerId,
    fielderName: '',
    incomingBatsmanId: '',
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRunButton = useCallback(
    (runs: number) => {
      if (currentPlan === 'free' && (runs === 4 || runs === 6)) {
        // On free plan, still record — just no wagon wheel premium feature
      }
      setPendingRuns(runs);
    },
    [currentPlan]
  );

  const handleConfirmBall = useCallback(
    (runs: number) => {
      const isExtra = selectedExtra !== 'none';
      const runsOffBat =
        selectedExtra === 'bye' || selectedExtra === 'leg_bye' || selectedExtra === 'wide'
          ? 0
          : runs;
      const extraRuns = isExtra ? runs : 0;

      onRecordBall(
        runsOffBat,
        extraRuns,
        selectedExtra,
        false,
        undefined,
        undefined,
        undefined,
        selectedZone ?? undefined,
        shotType === 'lofted',
        undefined
      );
      setPendingRuns(null);
      setSelectedExtra('none');
      setSelectedZone(null);
    },
    [selectedExtra, selectedZone, shotType, onRecordBall]
  );

  const handleRunClick = useCallback(
    (runs: number) => {
      handleRunButton(runs);
      // Auto-confirm immediately
      const isExtra = selectedExtra !== 'none';
      const runsOffBat =
        selectedExtra === 'bye' || selectedExtra === 'leg_bye' || selectedExtra === 'wide'
          ? 0
          : runs;
      const extraRuns = isExtra ? runs : 0;

      onRecordBall(
        runsOffBat,
        extraRuns,
        selectedExtra,
        false,
        undefined,
        undefined,
        undefined,
        selectedZone ?? undefined,
        shotType === 'lofted',
        undefined
      );
      setSelectedExtra('none');
      setSelectedZone(null);
      setPendingRuns(null);
    },
    [selectedExtra, selectedZone, shotType, onRecordBall, handleRunButton]
  );

  const handleWicketClick = useCallback(() => {
    setWicketState({
      wicketType: 'bowled',
      dismissedId: inning.currentStrikerId,
      fielderName: '',
      incomingBatsmanId: '',
    });
    setShowWicketModal(true);
  }, [inning.currentStrikerId]);

  const handleWicketConfirm = useCallback(() => {
    onRecordBall(
      0,
      0,
      selectedExtra,
      true,
      wicketState.wicketType,
      wicketState.incomingBatsmanId || undefined,
      wicketState.dismissedId,
      selectedZone ?? undefined,
      shotType === 'lofted',
      wicketState.fielderName || undefined
    );
    setShowWicketModal(false);
    setSelectedExtra('none');
    setSelectedZone(null);
  }, [onRecordBall, selectedExtra, selectedZone, shotType, wicketState]);

  const handleBowlerConfirm = useCallback(
    (bowlerId: string) => {
      onChangeBowler(bowlerId);
      setShowBowlerModal(false);
    },
    [onChangeBowler]
  );

  const handleExtraToggle = useCallback((type: ExtraType) => {
    setSelectedExtra((prev) => (prev === type ? 'none' : type));
  }, []);

  // ── Run button config ──────────────────────────────────────────────────────

  const runButtons = [
    { runs: 0, label: '0', className: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' },
    { runs: 1, label: '1', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' },
    { runs: 2, label: '2', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' },
    { runs: 3, label: '3', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' },
    { runs: 4, label: '4', className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' },
    { runs: 6, label: '6', className: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Free Hit Banner ─────────────────────────────────────────────── */}
      {inning.isFreeHitActive && (
        <div className="relative overflow-hidden rounded-2xl mb-3 bg-amber-400 px-4 py-2.5 flex items-center gap-2 shadow-lg animate-pulse">
          <Zap className="w-5 h-5 text-amber-900 flex-shrink-0" />
          <span className="font-black text-amber-900 text-sm uppercase tracking-widest">
            🔥 Free Hit!
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden select-none">

        {/* ── Innings Score Header ──────────────────────────────────────── */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: inning.teamColor || '#1e293b' }}
        >
          <div>
            <p className="text-white/70 text-xs font-medium">{inning.teamName}</p>
            <p className="text-white text-2xl font-black leading-tight">
              {inning.totalRuns}/{inning.wickets}
              <span className="text-base font-semibold ml-2 text-white/80">
                ({formatOvers(inning.oversCompleted, inning.ballsInCurrentOver)}/{match.overs} ov)
              </span>
            </p>
          </div>
          {inning.targetScore !== undefined && (
            <div className="text-right">
              <p className="text-white/70 text-xs">Need</p>
              <p className="text-white text-xl font-black">
                {inning.targetScore - inning.totalRuns}
              </p>
              <p className="text-white/60 text-xs">
                off {(match.overs - inning.oversCompleted) * 6 - inning.ballsInCurrentOver} balls
              </p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-4">

          {/* ── Batsmen Panel ────────────────────────────────────────────── */}
          <div className="bg-slate-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <span>Batsman</span>
              <span className="text-right">R</span>
              <span className="text-right">B</span>
              <span className="text-right">4s</span>
              <span className="text-right">6s</span>
            </div>

            {[striker, nonStriker].map((batter, idx) => {
              if (!batter) return null;
              const isStriker = idx === 0;
              return (
                <div
                  key={batter.playerId}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-4 py-2.5 items-center ${
                    isStriker ? 'bg-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isStriker && (
                      <span className="text-amber-500 font-black text-sm">*</span>
                    )}
                    <span className="font-semibold text-slate-900 truncate text-sm">
                      {batter.name}
                    </span>
                    <span className="text-slate-400 text-xs">
                      ({batter.strikeRate.toFixed(1)} SR)
                    </span>
                  </div>
                  <span className="text-right font-black text-slate-900 tabular-nums">
                    {batter.runs}
                  </span>
                  <span className="text-right font-semibold text-slate-600 tabular-nums text-sm">
                    {batter.balls}
                  </span>
                  <span className="text-right font-semibold text-blue-600 tabular-nums text-sm">
                    {batter.fours}
                  </span>
                  <span className="text-right font-semibold text-orange-500 tabular-nums text-sm">
                    {batter.sixes}
                  </span>
                </div>
              );
            })}

            {/* Swap Strike */}
            <div className="px-4 py-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={onSwapStrike}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Swap Strike
              </button>
            </div>
          </div>

          {/* ── Bowler Panel ─────────────────────────────────────────────── */}
          {currentBowler && (
            <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Bowling
                </p>
                <p className="font-black text-slate-900">{currentBowler.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentBowler.overs}.{currentBowler.balls} ov ·{' '}
                  {currentBowler.runsConceded} runs ·{' '}
                  {currentBowler.wickets}W ·{' '}
                  Econ {currentBowler.economy.toFixed(1)}
                </p>
              </div>
              <button
                onClick={() => setShowBowlerModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          )}

          {/* ── Current Over Dots ─────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              This Over
            </p>
            <div className="flex items-center gap-2 flex-wrap min-h-[2rem]">
              {currentOverBalls.length === 0 && (
                <span className="text-xs text-slate-300 italic">No balls yet</span>
              )}
              {currentOverBalls.map((ball, i) => (
                <BallDot key={ball.id ?? i} ball={ball} />
              ))}
              {/* Empty placeholders */}
              {Array.from({ length: Math.max(0, 6 - currentOverBalls.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200"
                />
              ))}
            </div>
          </div>

          {/* ── Extras Tabs ───────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Extras
            </p>
            <div className="flex flex-wrap gap-2">
              {EXTRA_TABS.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handleExtraToggle(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedExtra === type
                      ? type === 'wide'
                        ? 'bg-amber-400 border-amber-500 text-amber-900'
                        : type === 'no_ball'
                        ? 'bg-orange-500 border-orange-600 text-white'
                        : 'bg-slate-800 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedExtra !== 'none' && (
              <p className="text-xs text-slate-400 mt-1.5">
                Runs below = runs for{' '}
                <span className="font-semibold text-slate-700">
                  {EXTRA_TABS.find((e) => e.type === selectedExtra)?.label}
                </span>
              </p>
            )}
          </div>

          {/* ── Run Buttons ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-6 gap-2">
            {runButtons.map(({ runs, label, className }) => (
              <button
                key={runs}
                onClick={() => handleRunClick(runs)}
                className={`h-14 rounded-2xl border-2 font-black text-lg transition-all active:scale-95 shadow-sm ${className}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Wicket Button ─────────────────────────────────────────────── */}
          <button
            onClick={handleWicketClick}
            className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-lg tracking-widest uppercase transition-all shadow-md border-2 border-red-600 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            WICKET
          </button>

          {/* ── Wagon Wheel + Shot Type ───────────────────────────────────── */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Shot Direction
              </p>
              {/* Shot Type Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white">
                {(['ground', 'lofted'] as ShotType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setShotType(type)}
                    className={`px-3 py-1 text-xs font-bold transition-colors capitalize ${
                      shotType === type
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <WagonWheel
                selected={selectedZone}
                onSelect={(z) => setSelectedZone((prev) => (prev === z ? null : z))}
              />
              {selectedZone && (
                <p className="text-xs font-semibold text-blue-600">
                  ✓{' '}
                  {WAGON_ZONES.find((z) => z.zone === selectedZone)?.label ?? selectedZone}
                  {shotType === 'lofted' ? ' (Lofted)' : ' (Ground)'}
                </p>
              )}
            </div>
          </div>

          {/* ── Last 5 Overs History ─────────────────────────────────────── */}
          {last5OversData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Last {last5OversData.length} Overs
              </p>
              <div className="flex flex-col gap-2">
                {last5OversData.map((overBalls, overIdx) => {
                  const overRuns = overBalls.reduce(
                    (sum, b) => sum + b.runsOffBat + b.extraRuns,
                    0
                  );
                  const overWkts = overBalls.filter((b) => b.isWicket).length;
                  const globalOverIdx =
                    Math.max(0, inning.oversCompleted - last5OversData.length) + overIdx;
                  return (
                    <div key={globalOverIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5">
                        {globalOverIdx + 1}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap flex-1">
                        {overBalls.map((ball, bi) => (
                          <BallDot key={ball.id ?? bi} ball={ball} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-600 ml-auto">
                        {overRuns}
                        {overWkts > 0 && (
                          <span className="text-red-500">-{overWkts}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Bottom Action Row ─────────────────────────────────────────── */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onUndoLastBall}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Undo
            </button>
            <button
              onClick={onInningsBreak}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Innings Break
            </button>
            {currentPlan === 'free' && (
              <button
                onClick={onOpenPlans}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                Pro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Wicket Modal ──────────────────────────────────────────────────── */}
      {showWicketModal && (
        <WicketModal
          strikerId={inning.currentStrikerId}
          nonStrikerId={inning.currentNonStrikerId}
          batsmen={inning.batsmen}
          availableBatsmen={availableIncomingBatsmen}
          state={wicketState}
          onChange={setWicketState}
          onConfirm={handleWicketConfirm}
          onCancel={() => setShowWicketModal(false)}
        />
      )}

      {/* ── Change Bowler Modal ───────────────────────────────────────────── */}
      {showBowlerModal && (
        <ChangeBowlerModal
          currentBowlerId={inning.currentBowlerId}
          bowlers={inning.bowlers}
          bowlingTeamPlayers={bowlingTeamPlayers}
          maxOversPerBowler={match.maxOversPerBowler}
          totalOvers={match.overs}
          onConfirm={handleBowlerConfirm}
          onCancel={() => setShowBowlerModal(false)}
        />
      )}
    </>
  );
}
