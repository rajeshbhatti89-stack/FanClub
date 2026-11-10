// Core types for FanClub Cricket Scoring Web App

export type PlanType = 'free' | 'pro' | 'premium';

export interface PlanFeature {
  name: string;
  free: boolean;
  pro: boolean;
  premium: boolean;
}

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

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
  avatar?: string;
  matches?: number;
  runs?: number;
  wickets?: number;
  highestScore?: number;
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
  bowlerName?: string;
  catcherName?: string;
  wagonShots?: Array<{ direction: string; runs: number }>;
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
}

export type WicketType = 
  | 'bowled' 
  | 'caught' 
  | 'lbw' 
  | 'run_out' 
  | 'stumped' 
  | 'hit_wicket' 
  | 'retired_hurt' 
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
  wagonDirection?: string; // 'fine_leg' | 'square_leg' | 'mid_wicket' | 'long_on' | 'straight' | 'long_off' | 'cover' | 'point' | 'third_man'
  commentary: string;
  timestamp: number;
}

export interface Inning {
  teamId: string;
  teamName: string;
  teamColor: string;
  totalRuns: number;
  wickets: number;
  oversCompleted: number; // e.g., 4.3 represented as overs: 4, balls: 3
  ballsInCurrentOver: number;
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
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned';

export interface Match {
  id: string;
  title: string;
  venue: string;
  date: string;
  overs: number;
  ballType: 'tennis' | 'leather' | 'leather_white' | 'leather_pink';
  matchType: 'T20' | 'ODI' | 'Custom';
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
}

export interface TournamentTeamStats {
  teamId: string;
  teamName: string;
  teamColor: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: number; // Net Run Rate
}
