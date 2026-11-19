// ============================================================
// FAN CLUB — Master Cricket Data Types
// ============================================================

export type PlanType = 'free' | 'pro' | 'premium';

/** OBS Broadcast Overlay Themes — strictly for OBS Studio Browser Source */
export type ObsThemeId = 'wcFinal' | 'asiaCup' | 'sunsetIPL' | 'testClassic' | 'teamCustom';

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

export type CricketFormat = 'Test' | 'ODI' | 'T20I' | 'T20' | 'IPL' | 'List A' | 'First Class' | 'Domestic' | 'Box Cricket';

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
export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'T10' | '100 Balls' | 'Box Cricket' | 'Custom';

// ---- Format Specific Player Stats ----
export interface FormatStats {
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  highestScoreNotOut?: boolean;
  notOuts: number;
  fifties: number;
  hundreds: number;
  doubleHundreds?: number;
  strikeRate: number;
  battingAverage: number;
  fours: number;
  sixes: number;
  ducks: number;
  wickets: number;
  bowlingOvers: number;
  runsConceded: number;
  bowlingEconomy: number;
  bowlingAverage: number;
  bowlingStrikeRate: number;
  bestBowling: string;
  fourWicketHauls: number;
  fiveWicketHauls: number;
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface PlayerCareerHistory {
  year: number;
  team: string;
  tournament: string;
  role: string;
  runs: number;
  wickets: number;
  highlights?: string;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  date: string;
  tournament: string;
  description: string;
  badgeIcon: string;
}

// ---- Player ----
export interface Player {
  id: string;
  fanClubId: string; // Unique FanClub ID e.g. FC-IND-18001
  name: string;
  fullName?: string;
  displayName?: string;
  country: string;
  state?: string;
  city?: string;
  nationality: string;
  dateOfBirth?: string;
  age?: number;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle?: BowlingStyle;
  avatar?: string;
  jerseyNumber?: number;
  currentTeam?: string;
  teams: string[];
  isVerified: boolean;
  isInternational: boolean;
  isDomestic: boolean;
  isLocalClub: boolean;
  cricheroesId?: string;
  externalProviderIds?: Record<string, string>;
  dataProvenance: {
    source: 'cricHeroes' | 'sportmonks' | 'cricketData' | 'manual' | 'localClub' | 'system';
    importedAt: string;
    lastSyncedAt?: string;
    licenseAttribution?: string;
  };
  overallStats: FormatStats;
  statsByFormat: {
    test?: FormatStats;
    odi?: FormatStats;
    t20i?: FormatStats;
    ipl?: FormatStats;
    t20?: FormatStats;
    firstClass?: FormatStats;
    listA?: FormatStats;
    domestic?: FormatStats;
  };
  // Backward compatibility / convenience flat stat accessors:
  matches?: number;
  innings?: number;
  runs?: number;
  highestScore?: number;
  highestScoreNotOut?: boolean;
  notOuts?: number;
  strikeRate?: number;
  battingAverage?: number;
  fifties?: number;
  hundreds?: number;
  wickets?: number;
  bowlingEconomy?: number;
  bowlingAverage?: number;
  bestBowling?: string;
  catches?: number;
  runOuts?: number;
  stumpings?: number;

  achievements: PlayerAchievement[];
  careerHistory: PlayerCareerHistory[];
  digitalPassportUrl?: string;
  rankings?: {
    batting?: number;
    bowling?: number;
    allRounder?: number;
  };
  followerCount: number;
}

// ---- Local Club ----
export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state?: string;
  country: string;
  foundedYear?: number;
  logo?: string;
  banner?: string;
  primaryColor: string;
  secondaryColor: string;
  homeGround: string;
  president?: string;
  headCoach?: string;
  contactEmail?: string;
  contactPhone?: string;
  memberCount: number;
  teamsCount: number;
  trophiesCount: number;
  status: 'active' | 'archived';
  description?: string;
}

// ---- Team ----
export interface Team {
  id: string;
  clubId?: string;
  name: string;
  shortName: string;
  city?: string;
  country?: string;
  color: string;          // Primary hex
  secondaryColor: string; // Secondary hex (for OBS gradient)
  logo?: string;
  captain?: string;       // Player ID
  viceCaptain?: string;   // Player ID
  wicketkeeper?: string;  // Player ID
  players: Player[];
  teamStats?: {
    matches: number;
    won: number;
    lost: number;
    tied: number;
    noResult: number;
    winPercentage: number;
  };
  isOfficialFranchise?: boolean;
}

// ---- Ball Record & Scoring ----
export interface WagonShot {
  direction: string;
  runs: number;
  isLofted: boolean;
  timestamp: number;
}

export interface BallRecord {
  id?: string;
  ballId?: string;
  overIndex?: number;
  overNumber?: number;
  ballInOver?: number;
  ballNumber?: number;
  bowlerId: string;
  bowlerName: string;
  strikerId?: string;
  strikerName: string;
  batsmanId?: string;
  batsmanName?: string;
  nonStrikerId?: string;
  runsOffBat: number;
  extraRuns: number;
  extraType: ExtraType;
  isLegalBall?: boolean;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  fielderName?: string;
  wagonDirection?: string;
  isLofted?: boolean;
  isFreeHit: boolean;
  commentary: string;
  milestone?: string;
  timestamp: number | string;
}

// ---- Inning Batting & Bowling ----
export interface BatsmanInning {
  playerId: string;
  name: string;
  playerName?: string;
  runs: number;
  balls: number;
  ballsFaced?: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  didNotBat?: boolean;
  dismissal?: string;
  dismissalType?: WicketType;
  dismissalInfo?: string;
  wicketType?: WicketType;
  isOnStrike?: boolean;
  bowlerName?: string;
  fielderName?: string;
  wagonShots?: WagonShot[];
  milestones?: Array<'duck' | 'ten' | 'twenty_five' | 'fifty' | 'hundred' | 'max_6'>;
}

export interface BowlerInning {
  playerId: string;
  name: string;
  playerName?: string;
  overs: number;
  balls: number;
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

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs?: string;
  over?: string;
  batsmanName: string;
  batsmanId?: string;
  dismissal?: string;
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

export interface Inning {
  teamId: string;
  teamName: string;
  teamColor: string;
  totalRuns: number;
  wickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  isFreeHitActive: boolean;
  targetScore?: number;
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

// ---- Real-time Match Performers ----
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
  tournamentName?: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  overs: number;
  maxOversPerBowler: number;
  ballType: BallType;
  matchType: MatchFormat;
  format?: MatchFormat;
  teamA: Team;
  teamB: Team;
  team1?: Team;
  team2?: Team;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  currentInningIndex: 0 | 1;
  currentInnings?: number;
  innings: [Inning, Inning];
  status: MatchStatus;
  winnerTeamId?: string;
  winMargin?: string;
  winDescription?: string;
  resultSummary?: string;
  obsTheme: ObsThemeId;
  meta: MatchMeta;
  performers?: MatchPerformers;
  superOver?: boolean;
  isLiveBroadcast?: boolean;
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
  awards?: {
    playerOfTheTournament?: string;
    orangeCap?: { player: string; team: string; runs: number };
    purpleCap?: { player: string; team: string; wickets: number };
  };
}

// ---- Ground & Venue ----
export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
  floodlights: boolean;
  pitchType: 'Spin Friendly' | 'Pace & Bounce' | 'Flat Batting' | 'Balanced Turf';
  matchesHosted: number;
  imageUrl?: string;
}
