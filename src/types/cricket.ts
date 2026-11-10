// Comprehensive types for FanClub (CricHeroes Full Feature Replica)

export type PlanType = 'free' | 'pro' | 'premium';

export type ThemeId = 'wcFinal' | 'asiaCup' | 'cricHeroes' | 'sunsetIPL' | 'teamCustom';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  tag: string;
  requiresPlan: PlanType;
  headerBg: string;
  headerText: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  pitchGreen: string;
  isCustomTeam?: boolean;
}

export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
export type BattingStyle = 'RHB' | 'LHB';
export type BowlingStyle = 'Right-arm Fast' | 'Right-arm Medium' | 'Right-arm Spin' | 'Left-arm Fast' | 'Left-arm Spin';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  avatar?: string;
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  fifties: number;
  hundreds: number;
  strikeRate: number;
  battingAverage: number;
  wickets: number;
  bowlingEconomy: number;
  bestBowling: string;
  catches?: number;
  runOuts?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // Hex color for dynamic team theming!
  secondaryColor?: string;
  logo?: string;
  players: Player[];
}

export interface WagonShot {
  direction: string;
  runs: number;
  isLofted?: boolean;
}

export interface BatsmanInning {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
  dismissalType?: WicketType;
  bowlerName?: string;
  catcherName?: string;
  wagonShots?: WagonShot[];
}

export interface BowlerInning {
  playerId: string;
  name: string;
  overs: number;
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

export interface BallRecord {
  id: string;
  overIndex: number;
  ballInOver: number;
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
  isFreeHit?: boolean;
  commentary: string;
  timestamp: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  batsmanName: string;
  batsmanId: string;
}

export interface Partnership {
  wicketIndex: number;
  batsman1Name: string;
  batsman1Runs: number;
  batsman2Name: string;
  batsman2Runs: number;
  totalRuns: number;
  totalBalls: number;
}

export interface Inning {
  teamId: string;
  teamName: string;
  teamColor: string;
  totalRuns: number;
  wickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  isFreeHitActive?: boolean;
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

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned';

export interface MatchInfo {
  matchNumber: string;
  series: string;
  umpires: string[];
  scorer: string;
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
  pitchCondition: 'Batting Friendly' | 'Bowling Friendly' | 'Balanced Grass Turf';
}

export interface Match {
  id: string;
  title: string;
  venue: string;
  date: string;
  overs: number;
  maxOversPerBowler: number;
  ballType: 'tennis' | 'leather_white' | 'leather_red' | 'leather_pink';
  matchType: 'T20' | 'ODI' | 'Box Cricket' | 'Custom';
  teamA: Team;
  teamB: Team;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  currentInningIndex: 0 | 1;
  innings: [Inning, Inning];
  status: MatchStatus;
  winnerTeamId?: string;
  winMargin?: string;
  manOfTheMatchPlayerId?: string;
  manOfTheMatchName?: string;
  selectedTheme: ThemeId;
  info: MatchInfo;
}

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
  nrr: number; // Net Run Rate
  form: Array<'W' | 'L' | 'T' | 'NR'>;
}

export interface LeaderboardStats {
  orangeCap: { player: string; team: string; runs: number; innings: number; highest: number; sr: number };
  purpleCap: { player: string; team: string; wickets: number; innings: number; econ: number; best: string };
  mostSixes: { player: string; team: string; count: number };
  mostFours: { player: string; team: string; count: number };
  bestEconomy: { player: string; team: string; econ: number; overs: number };
}
