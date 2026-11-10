// ============================================================
// FanClub — Ball-by-Ball Commentary Generator
// ============================================================
import type { ExtraType, WicketType } from '../types/cricket';

const DOT_LINES = [
  "Dot ball! Tight line and length.",
  "Defended back to the bowler.",
  "Beaten outside off! Plays and misses.",
  "Full toss blocked back up the pitch.",
  "Soft hands, plays to point. No run.",
  "Back of a length, pushed to cover. Dot.",
  "Accurate delivery. Scoreless.",
  "Hit hard — straight to mid-on! Dot ball.",
];

const ONE_LINES = [
  "Nudged to mid-wicket for a single.",
  "Dabs it down to third man. Quick single.",
  "Pushes to cover, they scamper through.",
  "Fine leg brings up a soft single.",
  "One run. Good running between the wickets.",
  "Flicked off the pads, one to fine leg.",
];

const TWO_LINES = [
  "Driven to long-on — good running, TWO!",
  "Punched to deep cover, two good!",
  "Turned off the hip, they run a couple.",
  "Wide of mid-off, two runs comes through.",
];

const THREE_LINES = [
  "In the gap! They run THREE!",
  "Lofted over mid-wicket — lands safely. THREE!",
  "Powerful drive, beats the sweeper — THREE!",
];

const FOUR_LINES = [
  "FOUR! Driven beautifully through extra cover!",
  "FOUR! Cut shot — thunderous through backward point!",
  "FOUR! Swept hard to the backward square leg boundary!",
  "FOUR! Lofted down the ground, races to the rope!",
  "FOUR! Flicked off the pads to the fine leg fence!",
  "FOUR! Top edge flies over the keeper — FOUR!",
  "FOUR! Brilliant shot! Outside off, hammered through mid-off!",
  "FOUR! Pulled hard, splits the gap at mid-wicket!",
];

const SIX_LINES = [
  "SIX! MAXIMUM! Launches it into the stands!",
  "SIX! Cleared the rope with ease! HUGE HIT!",
  "SIX! Over long-on, row Z! What a shot!",
  "SIX! Reverse sweep — sails over the keeper's head!",
  "SIX! Full toss hammered over mid-wicket boundary!",
  "SIX! TOWERING! That went miles!",
];

const WICKET_LINES: Record<string, string[]> = {
  bowled: [
    "BOWLED HIM! The stumps are shattered!",
    "BOWLED! Clean through the gate — timber!",
    "BOWLED! The ball nips back and crashes into off stump!",
  ],
  caught: [
    "CAUGHT! Top edge, taken safely at mid-off!",
    "OUT! Caught at deep mid-wicket!",
    "CAUGHT! Goes hard, finds the fielder in the deep!",
  ],
  caught_behind: [
    "CAUGHT BEHIND! Feather edge, keeper takes it!",
    "BEHIND! Thin edge, brilliant take by the keeper!",
  ],
  caught_and_bowled: [
    "CAUGHT AND BOWLED! Great follow-through catch!",
    "C&B! Returns to the bowler — simple chance taken!",
  ],
  lbw: [
    "LBW! Stone dead in front! Up goes the finger!",
    "LBW! Huge appeal — given! That was plumb!",
    "OUT! Trapped in front, the umpire's finger goes up!",
  ],
  run_out: [
    "RUN OUT! Direct hit — brilliant fielding!",
    "RUN OUT! Called for a suicidal run! Chaos in the middle!",
    "SHORT! Direct throw, run out!",
  ],
  stumped: [
    "STUMPED! Down the track, missed it, keeper whips the bails!",
    "STUMPED! Dances out, can't reach it — out of his crease!",
  ],
  hit_wicket: [
    "HIT WICKET! Dislodges the bails on the backswing! Unlucky!",
    "HIT WICKET! Clips the stumps while trying to play the shot!",
  ],
  default: [
    "WICKET! That's out!",
    "OUT! Another one bites the dust!",
  ],
};

const EXTRA_LINES: Record<string, string[]> = {
  wide: [
    "Wide! Down the leg side, bowler straying.",
    "Wide called! Too far outside off.",
    "Wide! Sliding down the leg, umpire extends both arms.",
  ],
  no_ball: [
    "No ball! Bowler over the crease. Free hit to follow!",
    "No ball! That will be a free hit!",
    "Front foot over the crease — no ball!",
  ],
  bye: [
    "Byes! Missed by the keeper, two byes.",
    "It slips past the keeper — bye added.",
  ],
  leg_bye: [
    "Leg bye! Off the pad, runs signalled.",
    "Clips the pad, leg bye signalled by the umpire.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateBallCommentary(
  bowlerName: string,
  strikerName: string,
  runsOffBat: number,
  isWicket: boolean,
  wicketType?: WicketType,
  extraType?: ExtraType,
  wagonDirection?: string
): string {
  if (isWicket && wicketType) {
    const lines = WICKET_LINES[wicketType] || WICKET_LINES.default;
    const base = pick(lines);
    if (wicketType === 'run_out') return `${strikerName} — ${base}`;
    return `${bowlerName} to ${strikerName}... ${base}`;
  }

  if (extraType && extraType !== 'none') {
    const lines = EXTRA_LINES[extraType];
    if (lines) return `${bowlerName}: ${pick(lines)}`;
  }

  const totalRuns = runsOffBat;
  let base = '';
  if (totalRuns === 0) base = pick(DOT_LINES);
  else if (totalRuns === 1) base = pick(ONE_LINES);
  else if (totalRuns === 2) base = pick(TWO_LINES);
  else if (totalRuns === 3) base = pick(THREE_LINES);
  else if (totalRuns === 4) base = pick(FOUR_LINES);
  else if (totalRuns === 6) base = pick(SIX_LINES);
  else base = `${totalRuns} runs off the bat!`;

  const dirNote = wagonDirection ? ` (${wagonDirection.replace(/_/g, ' ')})` : '';
  return `${bowlerName} to ${strikerName}: ${base}${dirNote}`;
}

