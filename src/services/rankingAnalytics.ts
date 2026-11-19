// ============================================================
// FAN CLUB — Rankings, Analytics & Player Comparison Service
// ============================================================
import type { Player, Match } from '../types/cricket';
import { db } from '../db/database';

export interface PlayerRankEntry {
  rank: number;
  player: Player;
  rating: number;
  points: number;
  form: 'up' | 'down' | 'steady';
}

export class RankingAnalyticsService {
  public calculateBattingRankings(players: Player[] = db.getPlayers()): Player[] {
    return [...players].sort((a, b) => {
      const rA = a.overallStats.runs * (a.overallStats.strikeRate / 100) * (a.overallStats.battingAverage || 1);
      const rB = b.overallStats.runs * (b.overallStats.strikeRate / 100) * (b.overallStats.battingAverage || 1);
      return rB - rA;
    });
  }

  public calculateBowlingRankings(players: Player[] = db.getPlayers()): Player[] {
    return [...players].filter(p => p.overallStats.wickets > 0).sort((a, b) => {
      const rA = a.overallStats.wickets * 25 - (a.overallStats.bowlingEconomy || 8) * 10;
      const rB = b.overallStats.wickets * 25 - (b.overallStats.bowlingEconomy || 8) * 10;
      return rB - rA;
    });
  }

  public calculateAllRounderRankings(players: Player[] = db.getPlayers()): Player[] {
    return [...players].filter(p => p.overallStats.runs > 50 && p.overallStats.wickets > 0).sort((a, b) => {
      const scoreA = a.overallStats.runs * 0.5 + a.overallStats.wickets * 20;
      const scoreB = b.overallStats.runs * 0.5 + b.overallStats.wickets * 20;
      return scoreB - scoreA;
    });
  }

  public getTopBatsmen(limit = 10): PlayerRankEntry[] {
    const sorted = this.calculateBattingRankings();
    return sorted.slice(0, limit).map((p, idx) => ({
      rank: idx + 1,
      player: p,
      rating: Math.round(850 - idx * 28 + (p.overallStats.battingAverage || 30) * 2),
      points: p.overallStats.runs,
      form: idx % 3 === 0 ? 'up' : idx % 2 === 0 ? 'steady' : 'down',
    }));
  }

  public getTopBowlers(limit = 10): PlayerRankEntry[] {
    const sorted = this.calculateBowlingRankings();
    return sorted.slice(0, limit).map((p, idx) => ({
      rank: idx + 1,
      player: p,
      rating: Math.round(890 - idx * 32),
      points: p.overallStats.wickets,
      form: idx % 2 === 0 ? 'up' : 'steady',
    }));
  }

  public getTopAllRounders(limit = 10): PlayerRankEntry[] {
    const sorted = this.calculateAllRounderRankings();
    return sorted.slice(0, limit).map((p, idx) => ({
      rank: idx + 1,
      player: p,
      rating: Math.round(420 - idx * 18),
      points: Math.round(p.overallStats.runs * 0.5 + p.overallStats.wickets * 20),
      form: 'steady',
    }));
  }

  public comparePlayers(playerA: Player, playerB: Player) {
    const sA = playerA.overallStats;
    const sB = playerB.overallStats;

    const comparisons = [
      { label: 'Matches Played', metric: 'Matches Played', valA: sA.matches, valB: sB.matches, winner: sA.matches >= sB.matches ? 'A' : 'B', advantage: sA.matches >= sB.matches ? 'A' : 'B' },
      { label: 'Total Runs Scored', metric: 'Total Runs Scored', valA: sA.runs, valB: sB.runs, winner: sA.runs >= sB.runs ? 'A' : 'B', advantage: sA.runs >= sB.runs ? 'A' : 'B' },
      { label: 'Batting Average', metric: 'Batting Average', valA: Number(sA.battingAverage.toFixed(2)), valB: Number(sB.battingAverage.toFixed(2)), winner: sA.battingAverage >= sB.battingAverage ? 'A' : 'B', advantage: sA.battingAverage >= sB.battingAverage ? 'A' : 'B' },
      { label: 'Strike Rate', metric: 'Strike Rate', valA: Number(sA.strikeRate.toFixed(1)), valB: Number(sB.strikeRate.toFixed(1)), winner: sA.strikeRate >= sB.strikeRate ? 'A' : 'B', advantage: sA.strikeRate >= sB.strikeRate ? 'A' : 'B' },
      { label: 'Centuries (100s)', metric: 'Centuries (100s)', valA: sA.hundreds, valB: sB.hundreds, winner: sA.hundreds >= sB.hundreds ? 'A' : 'B', advantage: sA.hundreds >= sB.hundreds ? 'A' : 'B' },
      { label: 'Half-Centuries (50s)', metric: 'Half-Centuries (50s)', valA: sA.fifties, valB: sB.fifties, winner: sA.fifties >= sB.fifties ? 'A' : 'B', advantage: sA.fifties >= sB.fifties ? 'A' : 'B' },
      { label: 'Wickets Taken', metric: 'Wickets Taken', valA: sA.wickets, valB: sB.wickets, winner: sA.wickets >= sB.wickets ? 'A' : 'B', advantage: sA.wickets >= sB.wickets ? 'A' : 'B' },
      { label: 'Bowling Economy', metric: 'Bowling Economy', valA: Number((sA.bowlingEconomy || 99).toFixed(2)), valB: Number((sB.bowlingEconomy || 99).toFixed(2)), winner: (sA.bowlingEconomy || 99) <= (sB.bowlingEconomy || 99) ? 'A' : 'B', advantage: (sA.bowlingEconomy || 99) <= (sB.bowlingEconomy || 99) ? 'A' : 'B' },
      { label: 'Catches / Fielding', metric: 'Catches / Fielding', valA: sA.catches, valB: sB.catches, winner: sA.catches >= sB.catches ? 'A' : 'B', advantage: sA.catches >= sB.catches ? 'A' : 'B' },
    ];

    const advantageA = comparisons.filter(c => c.advantage === 'A').length;
    const advantageB = comparisons.filter(c => c.advantage === 'B').length;

    return {
      playerA,
      playerB,
      comparisons,
      metrics: comparisons,
      advantageA,
      advantageB,
    };
  }
}

export const rankingAnalyticsService = new RankingAnalyticsService();
