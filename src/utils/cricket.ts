// ============================================================
// FanClub — NRR Calculator Utility
// ============================================================
import type { TournamentTeamStats } from '../types/cricket';

export function calculateNRR(stats: TournamentTeamStats): number {
  const runsPerOverScored = stats.oversFaced > 0 ? stats.runsScored / stats.oversFaced : 0;
  const runsPerOverConceded = stats.oversBowled > 0 ? stats.runsConceded / stats.oversBowled : 0;
  return parseFloat((runsPerOverScored - runsPerOverConceded).toFixed(3));
}

export function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`;
}

export function oversToDecimal(overs: number, balls: number): number {
  return overs + balls / 6;
}

export function currentRunRate(runs: number, overs: number, balls: number): string {
  const totalBalls = overs * 6 + balls;
  if (totalBalls === 0) return '0.00';
  return ((runs / totalBalls) * 6).toFixed(2);
}

export function requiredRunRate(runsNeeded: number, ballsRemaining: number): string {
  if (ballsRemaining <= 0) return '∞';
  return ((runsNeeded / ballsRemaining) * 6).toFixed(2);
}

