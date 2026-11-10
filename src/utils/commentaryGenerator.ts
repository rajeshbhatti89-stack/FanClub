import type { ExtraType, WicketType } from '../types/cricket';

export function generateBallCommentary(
  bowlerName: string,
  strikerName: string,
  runs: number,
  isWicket: boolean,
  wicketType?: WicketType,
  extraType?: ExtraType,
  direction?: string
): string {
  const dirText = direction ? ` towards ${direction.replace('_', ' ')}` : '';

  if (extraType === 'wide') {
    return `${bowlerName} strays down the leg side, signaled WIDE by the umpire. Bonus run added!`;
  }
  if (extraType === 'no_ball') {
    return `SIREN GOES OFF! ${bowlerName} oversteps for a NO BALL! Free hit coming up next!`;
  }

  if (isWicket) {
    switch (wicketType) {
      case 'bowled':
        return `TIMBER! ${bowlerName} cleans him up! The off-stump goes cartwheeling into the evening sky. What a delivery to dismiss ${strikerName}!`;
      case 'caught':
        return `IN THE AIR AND TAKEN! ${strikerName} mistimed the lofted drive${dirText} and the fielder makes no mistake! Big wicket!`;
      case 'lbw':
        return `LOUD SHOUT AND UP GOES THE FINGER! ${bowlerName} traps ${strikerName} plumb in front! Dead straight!`;
      case 'run_out':
        return `DISASTER IN THE RUNNING! Direct hit at the stumps and ${strikerName} is caught well short of his crease! OUT!`;
      case 'stumped':
        return `BEATEN AND WHIPPED OFF! The keeper takes the bails off in a flash! ${strikerName} dragged his foot outside the crease.`;
      default:
        return `WICKET! ${strikerName} has to walk back! Huge moment in the match as ${bowlerName} strikes!`;
    }
  }

  if (runs === 6) {
    const sixPhrases = [
      `BOOM! ${strikerName} smokes it over the ropes${dirText}! High, handsome and deep into the stands for SIX!`,
      `MAXIMUM! Right out of the sweet spot! ${strikerName} picks the length in a split second and deposits it into the crowd!`,
      `STAND AND DELIVER! ${strikerName} launches ${bowlerName} deep into the grandstand! What a shot!`,
    ];
    return sixPhrases[Math.floor(Math.random() * sixPhrases.length)];
  }

  if (runs === 4) {
    const fourPhrases = [
      `CRACK! That raced away like a tracer bullet${dirText}! Effortless timing from ${strikerName} for FOUR!`,
      `FOUR! Sweetly timed through the gap${dirText}. Fielder had zero chance, pure cricketing brilliance!`,
      `SHOT! ${strikerName} leans into the drive${dirText} and finds the boundary rope in style!`,
    ];
    return fourPhrases[Math.floor(Math.random() * fourPhrases.length)];
  }

  if (runs === 0) {
    const dotPhrases = [
      `Dot ball. Good length delivery, ${strikerName} defends solidly back down the pitch.`,
      `Beaten! Searing pace and movement, ${strikerName} plays and misses outside off.`,
      `Defended into the covers. Good tight line maintained by ${bowlerName}.`,
    ];
    return dotPhrases[Math.floor(Math.random() * dotPhrases.length)];
  }

  if (runs === 1) {
    return `Tucked away${dirText} for a sharp single. Good communication between the batsmen.`;
  }
  if (runs === 2) {
    return `Pushed into the gap${dirText}. Excellent hustle between the wickets, they turn back and complete TWO comfortably!`;
  }
  if (runs === 3) {
    return `Superb running! Pushed deep into the outfield${dirText}, great athletic sprint for THREE runs!`;
  }

  return `${runs} runs taken by ${strikerName}${dirText}.`;
}

export function generateAiMatchInsights(
  teamAName: string,
  teamBName: string,
  target: number,
  currentRuns: number,
  wickets: number,
  _remainingBalls: number,
  currentRR: number,
  requiredRR: number
): { winProbabilityA: number; winProbabilityB: number; insight: string; keyBattle: string } {
  const needed = target - currentRuns;

  if (needed <= 0) {
    return {
      winProbabilityA: 0,
      winProbabilityB: 100,
      insight: `${teamBName} have chased down the target! Incredible run chase!`,
      keyBattle: 'Match Finished'
    };
  }

  let probB = 50;
  const rrDiff = currentRR - requiredRR;
  probB += rrDiff * 6;
  probB -= (wickets - 4) * 8;
  if (probB > 95) probB = 95;
  if (probB < 5) probB = 5;
  const probA = 100 - Math.round(probB);

  let insight = '';
  if (requiredRR > 12) {
    insight = `Pressure mounting on ${teamBName}! Required run rate has crept up to ${requiredRR.toFixed(2)}. ${teamAName} bowlers are bowling yorkers with deadly discipline.`;
  } else if (requiredRR < 6) {
    insight = `${teamBName} cruising in the chase! Current run rate of ${currentRR.toFixed(2)} is well above par.`;
  } else {
    insight = `Match hanging on a knife's edge! Both teams have equal chances in these death overs. Every dot ball swings the pendulum.`;
  }

  const keyBattle = `Death Overs Execution: Yorkers vs Boundary Hitting`;

  return {
    winProbabilityA: probA,
    winProbabilityB: Math.round(probB),
    insight,
    keyBattle
  };
}
