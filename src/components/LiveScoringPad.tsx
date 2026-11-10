import React, { useState } from 'react';
import type { Match, ThemeId, PlanType, ExtraType, WicketType } from '../types/cricket';
import { 
  RotateCcw, 
  ArrowLeftRight, 
  CircleDot, 
  Compass, 
  AlertCircle,
  Zap,
  Volume2,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cricketSound } from '../utils/audioEffects';

interface LiveScoringPadProps {
  match: Match;
  currentTheme: ThemeId;
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
}

const WAGON_DIRECTIONS = [
  { id: 'third_man', name: 'Third Man' },
  { id: 'point', name: 'Point' },
  { id: 'cover', name: 'Extra Cover' },
  { id: 'long_off', name: 'Long Off' },
  { id: 'straight', name: 'Straight' },
  { id: 'long_on', name: 'Long On' },
  { id: 'mid_wicket', name: 'Mid Wicket' },
  { id: 'square_leg', name: 'Square Leg' },
  { id: 'fine_leg', name: 'Fine Leg' },
];

export const LiveScoringPad: React.FC<LiveScoringPadProps> = ({
  match,
  onRecordBall,
  onUndoLastBall,
  onSwapStrike,
  onChangeBowler,
}) => {
  const currentInning = match.innings[match.currentInningIndex];
  const battingTeam = match.currentInningIndex === 0 ? match.teamA : match.teamB;
  const bowlingTeam = match.currentInningIndex === 0 ? match.teamB : match.teamA;

  // Active Players
  const striker = currentInning.batsmen.find(b => b.playerId === currentInning.currentStrikerId);
  const nonStriker = currentInning.batsmen.find(b => b.playerId === currentInning.currentNonStrikerId);
  const currentBowler = currentInning.bowlers.find(b => b.playerId === currentInning.currentBowlerId);

  // States for Modals
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [selectedWicketType, setSelectedWicketType] = useState<WicketType>('caught');
  const [selectedFielder, setSelectedFielder] = useState('');
  const [runOutBatsman, setRunOutBatsman] = useState<'striker' | 'nonStriker'>('striker');
  const [incomingBatsmanId, setIncomingBatsmanId] = useState('');

  // Shot Selector & Lofted Toggle
  const [selectedWagonDirection, setSelectedWagonDirection] = useState('cover');
  const [isLoftedShot, setIsLoftedShot] = useState(false);

  const [showBowlerSelectModal, setShowBowlerSelectModal] = useState(false);
  const [showCustomExtrasModal, setShowCustomExtrasModal] = useState(false);

  // Available batsmen from batting team who haven't batted or been dismissed
  const battedPlayerIds = new Set(currentInning.batsmen.map(b => b.playerId));
  const availableNextBatsmen = battingTeam.players.filter(p => !battedPlayerIds.has(p.id));

  // Handle standard run click
  const handleScoreRun = (runs: number) => {
    // Sound & Haptic FX
    if (runs === 0) {
      cricketSound.playDot();
    } else if (runs === 4) {
      cricketSound.playFour();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else if (runs === 6) {
      cricketSound.playSix();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.7 } });
    } else {
      cricketSound.playSingle();
    }

    onRecordBall(
      runs,
      0,
      'none',
      false,
      undefined,
      undefined,
      undefined,
      selectedWagonDirection,
      isLoftedShot
    );
  };

  // Handle Specific Extras with combined runs
  const handleScoreCustomExtra = (type: ExtraType, batRuns: number, bonusRuns: number) => {
    if (type === 'no_ball' || type === 'wide') {
      cricketSound.playSingle();
    }

    onRecordBall(
      batRuns,
      bonusRuns,
      type,
      false,
      undefined,
      undefined,
      undefined,
      selectedWagonDirection,
      isLoftedShot
    );

    setShowCustomExtrasModal(false);
  };

  // Handle Wicket Submission
  const handleConfirmWicket = () => {
    if (!incomingBatsmanId && availableNextBatsmen.length > 0) {
      alert('Please select the incoming batsman!');
      return;
    }

    cricketSound.playWicket();

    const dismissedId = (selectedWicketType === 'run_out' && runOutBatsman === 'nonStriker')
      ? nonStriker?.playerId
      : striker?.playerId;

    onRecordBall(
      0,
      0,
      'none',
      true,
      selectedWicketType,
      incomingBatsmanId || undefined,
      dismissedId,
      selectedWagonDirection,
      isLoftedShot,
      selectedFielder || undefined
    );

    setShowWicketModal(false);
    setIncomingBatsmanId('');
    setSelectedFielder('');
  };

  // Recent balls in the active over
  const currentOverBalls = currentInning.balls.slice(
    Math.max(0, currentInning.balls.length - currentInning.ballsInCurrentOver)
  );

  return (
    <div className="space-y-5">
      {/* Free Hit Banner Alert */}
      {currentInning.isFreeHitActive && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-slate-950" />
            FREE HIT COMING UP! Batter cannot be dismissed bowled, caught, or LBW!
          </span>
          <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
            OFFICIAL RULE
          </span>
        </div>
      )}

      {/* Active Batsmen & Bowler Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Batsmen Box */}
        <div className="md:col-span-7 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Batting • {battingTeam.shortName}
            </span>
            <button
              onClick={onSwapStrike}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Change who is on strike"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Swap Strike</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Striker */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              striker ? 'bg-amber-50/50 border-amber-200 ring-2 ring-amber-100/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-600 px-1.5 py-0.5 rounded bg-amber-100">
                  STRIKE *
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {striker ? striker.name : 'Select Striker'}
                </span>
              </div>
              {striker && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-black text-slate-900 text-base">
                    {striker.runs}
                    <span className="text-xs font-normal text-slate-500 ml-1">({striker.balls}b)</span>
                  </span>
                  <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                    <span>4s: {striker.fours} • 6s: {striker.sixes}</span>
                    <span className="ml-2 font-medium">SR: {striker.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Non-Striker */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-200">
                  NON-STRIKER
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {nonStriker ? nonStriker.name : 'Select Non-Striker'}
                </span>
              </div>
              {nonStriker && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-800 text-base">
                    {nonStriker.runs}
                    <span className="text-xs font-normal text-slate-500 ml-1">({nonStriker.balls}b)</span>
                  </span>
                  <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                    <span>4s: {nonStriker.fours} • 6s: {nonStriker.sixes}</span>
                    <span className="ml-2 font-medium">SR: {nonStriker.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Bowler Box */}
        <div className="md:col-span-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-rose-500" />
                Bowling • {bowlingTeam.shortName}
              </span>
              <button
                onClick={() => setShowBowlerSelectModal(true)}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Change Bowler
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {currentBowler ? currentBowler.name : 'Select Bowler'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Overs: {currentBowler ? `${currentBowler.overs}` : '0'} • Maidens: {currentBowler?.maidens || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-900">
                    {currentBowler ? `${currentBowler.wickets}-${currentBowler.runsConceded}` : '0-0'}
                  </span>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Econ: {currentBowler ? currentBowler.economy.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This Over Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500">THIS OVER:</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentInning.ballsInCurrentOver}/6 legal balls
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap min-h-8">
              {currentOverBalls.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No balls bowled in this over yet</span>
              ) : (
                currentOverBalls.map((b) => (
                  <span
                    key={b.id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      b.isWicket
                        ? 'bg-rose-600 text-white'
                        : b.runsOffBat === 6
                        ? 'bg-purple-600 text-white'
                        : b.runsOffBat === 4
                        ? 'bg-emerald-600 text-white'
                        : b.extraType !== 'none'
                        ? 'bg-amber-400 text-slate-950 text-[10px]'
                        : b.runsOffBat === 0
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {b.isWicket 
                      ? 'W' 
                      : b.extraType === 'wide' 
                      ? `Wd` 
                      : b.extraType === 'no_ball' 
                      ? `Nb` 
                      : b.runsOffBat}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CricHeroes Style Quick Scoring Pad */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-wide">
              BALL-BY-BALL SCORING CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wagon Direction Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold text-slate-600">Shot:</span>
              <select
                value={selectedWagonDirection}
                onChange={(e) => setSelectedWagonDirection(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {WAGON_DIRECTIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Lofted vs Ground Toggle */}
            <button
              onClick={() => setIsLoftedShot(!isLoftedShot)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isLoftedShot
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isLoftedShot ? '☁️ In the Air (Lofted)' : '🌱 Ground Shot'}
            </button>

            {/* Undo Last Ball */}
            <button
              onClick={onUndoLastBall}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              title="Revert the last recorded ball"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Ball</span>
            </button>
          </div>
        </div>

        {/* Primary Runs Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {/* 0 Runs (Dot) */}
          <button
            onClick={() => handleScoreRun(0)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-2xl shadow-xs active:scale-95 transition-all border border-slate-200/80 cursor-pointer"
          >
            <span>0</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Dot Ball</span>
          </button>

          {/* 1 Run */}
          <button
            onClick={() => handleScoreRun(1)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-black text-2xl shadow-xs active:scale-95 transition-all border border-blue-200 cursor-pointer"
          >
            <span>1</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Single</span>
          </button>

          {/* 2 Runs */}
          <button
            onClick={() => handleScoreRun(2)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-black text-2xl shadow-xs active:scale-95 transition-all border border-blue-200 cursor-pointer"
          >
            <span>2</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Double</span>
          </button>

          {/* 3 Runs */}
          <button
            onClick={() => handleScoreRun(3)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-black text-2xl shadow-xs active:scale-95 transition-all border border-blue-200 cursor-pointer"
          >
            <span>3</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Three</span>
          </button>

          {/* 4 Runs (FOUR) */}
          <button
            onClick={() => handleScoreRun(4)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:brightness-105 text-white font-black text-2xl shadow-md active:scale-95 transition-all ring-2 ring-emerald-200 cursor-pointer"
          >
            <span>4</span>
            <span className="text-[10px] font-extrabold uppercase mt-0.5 tracking-wider">FOUR!</span>
          </button>

          {/* 6 Runs (SIX) */}
          <button
            onClick={() => handleScoreRun(6)}
            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 hover:brightness-105 text-white font-black text-2xl shadow-md active:scale-95 transition-all ring-2 ring-purple-200 cursor-pointer"
          >
            <span>6</span>
            <span className="text-[10px] font-extrabold uppercase mt-0.5 tracking-wider">MAXIMUM!</span>
          </button>
        </div>

        {/* Extras & Wicket Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Quick Wide */}
          <button
            onClick={() => handleScoreCustomExtra('wide', 0, 1)}
            className="py-3 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
          >
            Wide (+1)
          </button>

          {/* Quick No Ball */}
          <button
            onClick={() => handleScoreCustomExtra('no_ball', 0, 1)}
            className="py-3 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
          >
            No Ball (+1)
          </button>

          {/* More Extras Dialog (Wd+runs, Nb+runs, Leg Bye, Bye, Penalty) */}
          <button
            onClick={() => setShowCustomExtrasModal(true)}
            className="py-3 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
          >
            More Extras...
          </button>

          {/* Quick Bye 1 */}
          <button
            onClick={() => handleScoreCustomExtra('bye', 0, 1)}
            className="py-3 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
          >
            1 Bye / Leg Bye
          </button>

          {/* OUT / WICKET BUTTON */}
          <button
            onClick={() => setShowWicketModal(true)}
            className="col-span-2 sm:col-span-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-105 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 fill-white text-rose-600" />
            <span>OUT / WICKET</span>
          </button>
        </div>
      </div>

      {/* MORE EXTRAS MODAL (CricHeroes Full Matrix) */}
      {showCustomExtrasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">CricHeroes Extras Keypad</h3>
            <p className="text-xs text-slate-500 mb-4">Record wides with runs, no-balls with boundaries, byes, or penalty</p>

            <div className="space-y-4 text-xs">
              {/* Wides */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Wide Combinations:</span>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleScoreCustomExtra('wide', 0, 1)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Wd (1)</button>
                  <button onClick={() => handleScoreCustomExtra('wide', 0, 2)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Wd + 1 (2)</button>
                  <button onClick={() => handleScoreCustomExtra('wide', 0, 3)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Wd + 2 (3)</button>
                  <button onClick={() => handleScoreCustomExtra('wide', 0, 5)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Wd + 4 (5)</button>
                </div>
              </div>

              {/* No Balls */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">No Ball Combinations (Runs off bat):</span>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleScoreCustomExtra('no_ball', 0, 1)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Nb (1)</button>
                  <button onClick={() => handleScoreCustomExtra('no_ball', 1, 1)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold">Nb + 1 (2)</button>
                  <button onClick={() => handleScoreCustomExtra('no_ball', 4, 1)} className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">Nb + 4 (5)</button>
                  <button onClick={() => handleScoreCustomExtra('no_ball', 6, 1)} className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold">Nb + 6 (7)</button>
                </div>
              </div>

              {/* Byes / Leg Byes */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Byes & Leg Byes:</span>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleScoreCustomExtra('bye', 0, 1)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold">1 Bye</button>
                  <button onClick={() => handleScoreCustomExtra('bye', 0, 4)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold">4 Byes</button>
                  <button onClick={() => handleScoreCustomExtra('leg_bye', 0, 1)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold">1 Leg Bye</button>
                  <button onClick={() => handleScoreCustomExtra('leg_bye', 0, 4)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold">4 Leg Byes</button>
                </div>
              </div>

              {/* Penalty */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Penalty:</span>
                <button onClick={() => handleScoreCustomExtra('penalty', 0, 5)} className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-center">
                  +5 Penalty Runs to Batting Team
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCustomExtrasModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE CRICHEROES WICKET MODAL */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-scaleUp max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                W
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Wicket Dismissal</h3>
                <p className="text-xs text-slate-500">Official CricHeroes dismissal classification</p>
              </div>
            </div>

            {/* Who is Out (for Run Out) */}
            <div className="mb-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">Who is Dismissed?</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRunOutBatsman('striker')}
                  className={`p-2.5 rounded-xl font-bold border transition-all ${
                    runOutBatsman === 'striker' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Striker: {striker?.name}
                </button>
                <button
                  type="button"
                  onClick={() => setRunOutBatsman('nonStriker')}
                  className={`p-2.5 rounded-xl font-bold border transition-all ${
                    runOutBatsman === 'nonStriker' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Non-Striker: {nonStriker?.name}
                </button>
              </div>
            </div>

            {/* Wicket Types (All official modes) */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Dismissal Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['caught', 'bowled', 'lbw', 'run_out', 'stumped', 'caught_behind', 'caught_and_bowled', 'hit_wicket', 'retired_hurt'] as WicketType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedWicketType(type)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                      selectedWicketType === type
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Fielder assist if caught or run out */}
            {(selectedWicketType === 'caught' || selectedWicketType === 'run_out') && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {selectedWicketType === 'caught' ? 'Caught by Fielder:' : 'Throw / Fielder Assist:'}
                </label>
                <select
                  value={selectedFielder}
                  onChange={(e) => setSelectedFielder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="">-- Select Fielder ({bowlingTeam.name}) --</option>
                  {bowlingTeam.players.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Select Incoming Batsman */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Next Incoming Batsman</label>
              {availableNextBatsmen.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  All out! No further batsmen available for this team.
                </div>
              ) : (
                <select
                  value={incomingBatsmanId}
                  onChange={(e) => setIncomingBatsmanId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
                  <option value="">-- Choose New Batter --</option>
                  {availableNextBatsmen.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowWicketModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWicket}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE BOWLER MODAL */}
      {showBowlerSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Select Next Bowler</h3>
            <p className="text-xs text-slate-500 mb-4">Choose from {bowlingTeam.name} squad (Max {match.maxOversPerBowler || 4} ov)</p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {bowlingTeam.players.map((p) => {
                const bStat = currentInning.bowlers.find(b => b.playerId === p.id);
                const oversBowled = bStat ? bStat.overs : 0;
                const maxOvers = match.maxOversPerBowler || 4;
                const isLimitReached = oversBowled >= maxOvers;

                return (
                  <button
                    key={p.id}
                    disabled={isLimitReached}
                    onClick={() => {
                      onChangeBowler(p.id);
                      setShowBowlerSelectModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isLimitReached 
                        ? 'opacity-40 bg-slate-100 cursor-not-allowed'
                        : p.id === currentInning.currentBowlerId
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <span>{p.name}</span>
                      <span className="text-[10px] text-slate-400 block font-normal capitalize">
                        {p.bowlingStyle || p.role}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {oversBowled}/{maxOvers} ov {bStat ? `(${bStat.wickets}-${bStat.runsConceded})` : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowBowlerSelectModal(false)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
