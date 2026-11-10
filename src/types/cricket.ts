// ============================================================
// FanClub — Full CricHeroes Clone Types
// ============================================================

export type PlanType = 'free' | 'pro' | 'premium';

/** OBS Broadcast Overlay Themes — strictly for OBS Studio Browser Source */
export type ObsThemeId = 'wcFinal' | 'asiaCup' | 'sunsetIPL' | 'teamCustom';

export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
export type BattingStyle = 'RHB' | 'LHB';
export type BowlingStyle =
  | 'Right-arm Fast'
  | 'Right-arm Fast-Medium'
  | 'Right-arm Medium'
  | 'Right-arm Off-Spin'
  | 'Right-arm Leg-Spin'
  | 'Left-arm Fast'
  | 'Left-arm Fast-Medium'
  | 'Left-arm Orthodox Spin'
  | 'Left-arm Wrist Spin';

export type WicketType =
  | 'bowled'
  | 'caught'
  | 'caught_behind'
  | 'caught_and_bowled'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt'
  | 'retired_out'
  | 'obstructing_field'
  | 'timed_out';

export type ExtraType = 'none' | 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'penalty';

export type MatchStatus = 'upcoming' | 'live' | 'innings_break' | 'completed' | 'abandoned';

export type BallType = 'tennis' | 'leather_white' | 'leather_red' | 'leather_pink' | 'rubber';
export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'T10' | 'Box Cricket' | 'Custom';

// ---- Player ----
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  avatar?: string; // base64 or URL
  jerseyNumber?: number;
  // Career stats
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  notOuts: number;
  fifties: number;
  hundreds: number;
  strikeRate: number;
  battingAverage: number;
  wickets: number;
  bowlingEconomy: number;
  bowlingAverage: number;
  bestBowling: string;
  catches: number;
  runOuts: number;
  stumpings: number;
}

// ---- Team ----
export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;          // Primary hex
  secondaryColor: string; // Secondary hex (for OBS gradient)
  logo?: string;          // base64 or URL
  captain?: string;       // Player ID
  wicketkeeper?: string;  // Player ID
  players: Player[];
}

// ---- Ball ----
export interface WagonShot {
  direction: string;
  runs: number;
  isLofted: boolean;
  timestamp: number;
}

export interface BallRecord {
  id: string;
  overIndex: number;
  ballInOver: number; // 1-6 for legal, 0 for extras
  bowlerId: string;
  bowlerName: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  runsOffBat: number;
  extraRuns: number;
  extraType: ExtraType;
  isLegalBall: boolean;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  fielderName?: string;
  wagonDirection?: string;
  isLofted?: boolean;
  isFreeHit: boolean;
  commentary: string;
  timestamp: number;
}

// ---- Batting / Bowling per Inning ----
export interface BatsmanInning {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  didNotBat?: boolean;
  dismissal?: string;
  dismissalType?: WicketType;
  bowlerName?: string;
  fielderName?: string;
  wagonShots: WagonShot[];
  milestones: Array<'duck' | 'ten' | 'twenty_five' | 'fifty' | 'hundred' | 'max_6'>;
}

export interface BowlerInning {
  playerId: string;
  name: string;
  overs: number;         // completed overs (integer)
  balls: number;         // balls in current over
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
  dots: number;
  foursConceded: number;
  sixesConceded: number;
}

// ---- Fall of Wickets / Partnership ----
export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  batsmanName: string;
  batsmanId: string;
  dismissal: string;
}

export interface Partnership {
  wicketIndex: number;
  batsman1Id: string;
  batsman1Name: string;
  batsman1Runs: number;
  batsman2Id: string;
  batsman2Name: string;
  batsman2Runs: number;
  totalRuns: number;
  totalBalls: number;
}

// ---- Inning ----
export interface Inning {
  teamId: string;
  teamName: string;
  teamColor: string;
  totalRuns: number;
  wickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  isFreeHitActive: boolean;
  targetScore?: number; // set for 2nd innings
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalties: number;
    total: number;
  };
  batsmen: BatsmanInning[];
  bowlers: BowlerInning[];
  balls: BallRecord[];
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
}

// ---- Match Performers ----
export interface MatchPerformers {
  bestBatsman?: {
    name: string;
    team: string;
    teamColor: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  };
  bestBowler?: {
    name: string;
    team: string;
    teamColor: string;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    economy: number;
  };
  manOfTheMatch?: {
    name: string;
    team: string;
    teamColor: string;
    performance: string;
    points: number;
  };
}

// ---- Match Info ----
export interface MatchMeta {
  matchNumber: string;
  series: string;
  umpire1: string;
  umpire2: string;
  thirdUmpire: string;
  referee: string;
  scorer: string;
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
  pitchCondition: string;
  weatherCondition: string;
  dls: boolean;
}

// ---- Match ----
export interface Match {
  id: string;
  tournamentId?: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  overs: number;
  maxOversPerBowler: number;
  ballType: BallType;
  matchType: MatchFormat;
  teamA: Team;
  teamB: Team;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  currentInningIndex: 0 | 1;
  innings: [Inning, Inning];
  status: MatchStatus;
  winnerTeamId?: string;
  winMargin?: string;
  winDescription?: string;
  obsTheme: ObsThemeId;
  meta: MatchMeta;
  performers?: MatchPerformers;
  superOver?: boolean;
}

// ---- Tournament ----
export interface TournamentTeamStats {
  teamId: string;
  teamName: string;
  teamColor: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nr: number;
  points: number;
  nrr: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  form: Array<'W' | 'L' | 'T' | 'NR'>;
}

export interface TournamentFixture {
  id: string;
  matchId?: string;
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  venue: string;
  date: string;
  time: string;
  round: string;
  status: 'scheduled' | 'live' | 'completed' | 'abandoned';
  result?: string;
}

export interface Tournament {
  id: string;
  name: string;
  shortName?: string;
  organizer: string;
  city: string;
  bannerUrl?: string;
  logoUrl?: string;
  startDate: string;
  endDate: string;
  overs: number;
  ballType: string;
  format: 'league' | 'knockout' | 'league_knockout' | 'round_robin';
  teams: Team[];
  fixtures: TournamentFixture[];
  status: 'upcoming' | 'ongoing' | 'completed';
  standings: TournamentTeamStats[];
  prizePool?: string;
  description?: string;
}

// ---- Leaderboard ----
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  teamName: string;
  teamColor: string;
  value: number;
  extra?: string;
}

export interface TournamentLeaderboards {
  orangeCap: LeaderboardEntry[];     // Most runs
  purpleCap: LeaderboardEntry[];     // Most wickets
  mostSixes: LeaderboardEntry[];
  mostFours: LeaderboardEntry[];
  bestStrikeRate: LeaderboardEntry[];
  bestEconomy: LeaderboardEntry[];
  bestCatcher: LeaderboardEntry[];
}

