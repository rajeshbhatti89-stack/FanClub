// ============================================================
// FanClub — Match Performers Calculator (Real-time MVP)
// ============================================================
import type { Match, MatchPerformers } from '../types/cricket';

export function computeMatchPerformers(match: Match): MatchPerformers {
  // Collect all batsmen across both innings
  const allBatsmen = [
    ...match.innings[0].batsmen.map(b => ({
      ...b,
      team: match.teamA.shortName,
      teamColor: match.teamA.color,
    })),
    ...match.innings[1].batsmen.map(b => ({
      ...b,
      team: match.teamB.shortName,
      teamColor: match.teamB.color,
    })),
  ].filter(b => b.balls > 0 || b.runs > 0);

  const sortedBat = [...allBatsmen].sort((a, b) => {
    if (b.runs !== a.runs) return b.runs - a.runs;
    return b.strikeRate - a.strikeRate;
  });
  const bestBat = sortedBat[0];

  // Collect all bowlers across both innings
  const allBowlers = [
    ...match.innings[0].bowlers.map(b => ({
      ...b,
      team: match.teamB.shortName,
      teamColor: match.teamB.color,
    })),
    ...match.innings[1].bowlers.map(b => ({
      ...b,
      team: match.teamA.shortName,
      teamColor: match.teamA.color,
    })),
  ].filter(b => b.overs > 0 || b.balls > 0);

  const sortedBowl = [...allBowlers].sort((a, b) => {
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    if (a.economy !== b.economy) return a.economy - b.economy;
    return a.runsConceded - b.runsConceded;
  });
  const bestBowl = sortedBowl[0];

  // MVP Impact Points
  interface Impact { name: string; team: string; teamColor: string; pts: number; perf: string; }
  const impacts: Impact[] = [];

  const processTeam = (
    teamShort: string,
    teamColor: string,
    batInningIdx: 0 | 1,
    bowlInningIdx: 0 | 1
  ) => {
    const batInning = match.innings[batInningIdx];
    const bowlInning = match.innings[bowlInningIdx];

    const teamPlayers = batInningIdx === 0 ? match.teamA.players : match.teamB.players;
    teamPlayers.forEach(p => {
      const bat = batInning.batsmen.find(b => b.playerId === p.id);
      const bowl = bowlInning.bowlers.find(b => b.playerId === p.id);

      let pts = 0;
      const parts: string[] = [];

      if (bat && (bat.runs > 0 || bat.balls > 0)) {
        pts += bat.runs * 1;
        pts += bat.fours * 1;
        pts += bat.sixes * 2;
        if (bat.strikeRate >= 150) pts += 10;
        if (bat.runs >= 25) pts += 5;
        if (bat.runs >= 50) pts += 20;
        if (bat.runs >= 100) pts += 40;
        if (bat.runs === 0 && bat.balls > 0) pts -= 5; // duck
        parts.push(`${bat.runs}(${bat.balls}b)`);
      }

      if (bowl && (bowl.overs > 0 || bowl.balls > 0)) {
        pts += bowl.wickets * 25;
        pts += bowl.maidens * 12;
        pts += bowl.dots * 1;
        if (bowl.economy <= 5.0 && (bowl.overs > 0 || bowl.balls >= 3)) pts += 15;
        if (bowl.wickets >= 3) pts += 15;
        if (bowl.wickets >= 5) pts += 25;
        if (bowl.wickets > 0) {
          parts.push(`${bowl.wickets}/${bowl.runsConceded}(${bowl.overs}.${bowl.balls}ov)`);
        }
      }

      if (pts > 0) {
        impacts.push({
          name: p.name,
          team: teamShort,
          teamColor,
          pts: Math.round(pts),
          perf: parts.join(' & ') || 'Field Impact',
        });
      }
    });
  };

  processTeam(match.teamA.shortName, match.teamA.color, 0, 1);
  processTeam(match.teamB.shortName, match.teamB.color, 1, 0);

  const topMvp = [...impacts].sort((a, b) => b.pts - a.pts)[0];

  return {
    bestBatsman: bestBat
      ? {
          name: bestBat.name,
          team: bestBat.team,
          teamColor: bestBat.teamColor,
          runs: bestBat.runs,
          balls: bestBat.balls,
          fours: bestBat.fours,
          sixes: bestBat.sixes,
          strikeRate: bestBat.strikeRate,
        }
      : undefined,
    bestBowler: bestBowl
      ? {
          name: bestBowl.name,
          team: bestBowl.team,
          teamColor: bestBowl.teamColor,
          overs: bestBowl.overs,
          maidens: bestBowl.maidens,
          runsConceded: bestBowl.runsConceded,
          wickets: bestBowl.wickets,
          economy: bestBowl.economy,
        }
      : undefined,
    manOfTheMatch: topMvp
      ? {
          name: topMvp.name,
          team: topMvp.team,
          teamColor: topMvp.teamColor,
          performance: topMvp.perf,
          points: topMvp.pts,
        }
      : undefined,
  };
}

