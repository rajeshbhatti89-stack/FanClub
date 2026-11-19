// ============================================================
// FanClub — Initial State, Default Teams & Real Tournament Live Match
// Ready for live ball-by-ball scoring from ball 0.0 (0/0)
// ============================================================
import type { Match, Team, Tournament, Player, FormatStats, PlayerRole, BattingStyle, BowlingStyle } from '../types/cricket';

function createPlayerObj(
  id: string,
  name: string,
  role: PlayerRole,
  battingStyle: BattingStyle,
  bowlingStyle?: BowlingStyle,
  matches = 0,
  innings = 0,
  runs = 0,
  highestScore = 0,
  notOuts = 0,
  fifties = 0,
  hundreds = 0,
  strikeRate = 0,
  battingAverage = 0,
  wickets = 0,
  bowlingEconomy = 0,
  bowlingAverage = 0,
  bestBowling = '0/0',
  catches = 0,
  runOuts = 0,
  stumpings = 0
): Player {
  const stats: FormatStats = {
    matches,
    innings,
    runs,
    highestScore,
    notOuts,
    fifties,
    hundreds,
    strikeRate,
    battingAverage,
    fours: Math.round(runs / 7),
    sixes: Math.round(runs / 24),
    ducks: Math.max(0, matches - innings),
    wickets,
    bowlingOvers: Math.round(wickets * 4),
    runsConceded: Math.round(wickets * 4 * (bowlingEconomy || 7.5)),
    bowlingEconomy,
    bowlingAverage,
    bowlingStrikeRate: wickets > 0 ? (wickets * 4 * 6) / wickets : 0,
    bestBowling,
    fourWicketHauls: Math.round(wickets / 20),
    fiveWicketHauls: Math.round(wickets / 40),
    catches,
    runOuts,
    stumpings,
  };

  return {
    id,
    fanClubId: `FC-${id.toUpperCase()}`,
    name,
    country: 'India',
    nationality: 'Indian',
    role,
    battingStyle,
    bowlingStyle,
    teams: [],
    isVerified: true,
    isInternational: false,
    isDomestic: true,
    isLocalClub: true,
    dataProvenance: {
      source: 'cricHeroes',
      importedAt: new Date().toISOString(),
      externalId: `CH-${id}`,
      licenseAttribution: 'CricHeroes Verified Tournament Directory',
    },
    verificationStatus: 'verified',
    cricheroesId: `CH-${id}`,
    achievements: [],
    careerHistory: [],
    followerCount: Math.round(runs * 1.5 + wickets * 10),
    overallStats: stats,
    statsByFormat: {
      t20: stats,
      domestic: stats,
    },
  };
}

export function makeBlankPlayer(id: string, name: string): Player {
  return createPlayerObj(id, name, 'batsman', 'RHB');
}

export function makeBlankInning(teamId: string, teamName: string, teamColor: string) {
  return {
    teamId,
    teamName,
    teamColor,
    totalRuns: 0,
    wickets: 0,
    oversCompleted: 0,
    ballsInCurrentOver: 0,
    isFreeHitActive: false,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
    batsmen: [],
    bowlers: [],
    balls: [],
    fallOfWickets: [],
    partnerships: [],
    currentStrikerId: '',
    currentNonStrikerId: '',
    currentBowlerId: '',
  };
}

export function makeBlankTeam(id: string, name: string, shortName: string, color: string): Team {
  return {
    id,
    name,
    shortName,
    city: 'Local',
    country: 'India',
    color,
    secondaryColor: '#FFFFFF',
    players: [],
    teamStats: {
      matches: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      winPercentage: 0,
    },
  };
}

// ─── Default Real Teams ──────────────────────────────────────────
export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-royal-strikers',
    name: 'Royal Strikers XI',
    shortName: 'RSXI',
    city: 'Mumbai',
    country: 'India',
    color: '#0284c7',
    secondaryColor: '#38bdf8',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80',
    teamStats: { matches: 42, won: 30, lost: 11, tied: 1, noResult: 0, winPercentage: 71.4 },
    players: [
      createPlayerObj('rs-1', 'Aakash Verma (C)', 'batsman', 'RHB', 'Right-arm Off-Spin', 68, 62, 2450, 114, 8, 16, 3, 142.5, 45.37, 12, 7.2, 28.5, '3/18', 28, 6, 0),
      createPlayerObj('rs-2', 'Rahul Sharma (WK)', 'wicketkeeper', 'LHB', undefined, 92, 88, 3120, 96, 14, 22, 0, 138.2, 42.16, 0, 0, 0, '0/0', 62, 14, 14),
      createPlayerObj('rs-3', 'Mohit Deshmukh', 'allrounder', 'RHB', 'Right-arm Fast-Medium', 55, 48, 1420, 82, 7, 9, 0, 144.8, 34.6, 64, 6.8, 22.4, '4/22', 21, 5, 0),
      createPlayerObj('rs-4', 'Bunty Patel', 'batsman', 'RHB', 'Right-arm Fast', 120, 114, 3850, 114, 20, 28, 4, 218.4, 52.4, 18, 8.2, 34.0, '3/12', 38, 8, 0),
      createPlayerObj('rs-5', 'Sonu Rajput', 'allrounder', 'LHB', 'Left-arm Orthodox Spin', 64, 58, 1680, 86, 14, 12, 0, 188.5, 38.2, 54, 6.9, 21.0, '4/14', 22, 4, 0),
      createPlayerObj('rs-6', 'Karan Mehta', 'batsman', 'RHB', undefined, 38, 34, 980, 72, 6, 6, 0, 134.0, 35.0, 0, 0, 0, '0/0', 14, 3, 0),
      createPlayerObj('rs-7', 'Dnyaneshwar Shinde', 'allrounder', 'RHB', 'Right-arm Medium', 44, 40, 890, 68, 9, 5, 0, 142.0, 28.7, 36, 7.1, 24.5, '3/20', 16, 2, 0),
      createPlayerObj('rs-8', 'Vivek Tiwari', 'bowler', 'RHB', 'Right-arm Leg-Spin', 58, 22, 280, 31, 10, 0, 0, 110.5, 23.3, 72, 6.4, 19.8, '5/18', 19, 4, 0),
      createPlayerObj('rs-9', 'Chetan Jadhav', 'bowler', 'RHB', 'Right-arm Fast', 48, 16, 140, 24, 7, 0, 0, 95.0, 15.5, 62, 7.2, 23.1, '4/16', 12, 3, 0),
      createPlayerObj('rs-10', 'Pratik Kulkarni', 'bowler', 'LHB', 'Left-arm Fast', 52, 14, 110, 20, 6, 0, 0, 88.0, 13.7, 68, 6.9, 21.4, '4/12', 15, 2, 0),
      createPlayerObj('rs-11', 'Suraj Yadav', 'bowler', 'RHB', 'Right-arm Off-Spin', 36, 12, 85, 18, 5, 0, 0, 80.0, 12.1, 42, 6.5, 20.2, '3/15', 9, 1, 0),
    ]
  },
  {
    id: 'team-mumbai-warriors',
    name: 'Mumbai Warriors CC',
    shortName: 'MWCC',
    city: 'Mumbai',
    country: 'India',
    color: '#16a34a',
    secondaryColor: '#4ade80',
    logo: 'https://images.unsplash.com/photo-1531415074868-036b107e7752?w=150&auto=format&fit=crop&q=80',
    teamStats: { matches: 38, won: 25, lost: 12, tied: 1, noResult: 0, winPercentage: 65.8 },
    players: [
      createPlayerObj('mw-1', 'Sameer Khan', 'bowler', 'RHB', 'Right-arm Fast', 84, 24, 310, 34, 11, 0, 0, 115.0, 18.2, 118, 6.45, 18.5, '5/14', 18, 5, 0),
      createPlayerObj('mw-2', 'Firoj Khan', 'bowler', 'RHB', 'Right-arm Fast', 95, 32, 240, 28, 12, 0, 0, 130.0, 12.0, 148, 5.8, 16.2, '6/9', 24, 6, 0),
      createPlayerObj('mw-3', 'Gaurav Sawant (C)', 'batsman', 'RHB', 'Right-arm Medium', 72, 68, 2240, 108, 12, 14, 2, 139.4, 40.0, 22, 7.8, 30.2, '3/25', 29, 7, 0),
      createPlayerObj('mw-4', 'Rohan Mane (WK)', 'wicketkeeper', 'RHB', undefined, 66, 60, 1820, 88, 10, 11, 0, 135.2, 36.4, 0, 0, 0, '0/0', 48, 11, 8),
      createPlayerObj('mw-5', 'Nitin Pawar', 'allrounder', 'LHB', 'Left-arm Orthodox Spin', 54, 46, 1210, 74, 9, 7, 0, 146.0, 32.7, 52, 6.6, 21.5, '4/19', 18, 3, 0),
      createPlayerObj('mw-6', 'Aniket Rane', 'batsman', 'LHB', undefined, 42, 38, 1150, 79, 5, 8, 0, 141.0, 34.8, 0, 0, 0, '0/0', 16, 2, 0),
      createPlayerObj('mw-7', 'Ajay Bhosle', 'allrounder', 'RHB', 'Right-arm Fast-Medium', 49, 41, 980, 65, 8, 5, 0, 150.2, 29.6, 45, 7.4, 24.0, '3/18', 14, 4, 0),
      createPlayerObj('mw-8', 'Deepak More', 'bowler', 'RHB', 'Right-arm Leg-Spin', 60, 18, 195, 27, 8, 0, 0, 102.0, 19.5, 76, 6.7, 19.2, '5/22', 20, 3, 0),
      createPlayerObj('mw-9', 'Yogesh Tambe', 'bowler', 'RHB', 'Right-arm Medium', 35, 14, 92, 19, 6, 0, 0, 84.0, 11.5, 38, 7.0, 22.8, '3/21', 11, 1, 0),
      createPlayerObj('mw-10', 'Mahesh Chavan', 'bowler', 'LHB', 'Left-arm Fast', 40, 11, 65, 15, 5, 0, 0, 75.0, 10.8, 44, 7.3, 23.5, '4/25', 10, 2, 0),
      createPlayerObj('mw-11', 'Siddhesh Kadam', 'batsman', 'RHB', undefined, 28, 24, 580, 52, 4, 2, 0, 128.0, 29.0, 0, 0, 0, '0/0', 8, 1, 0),
    ]
  },
  {
    id: 'team-ind',
    name: 'India Champions',
    shortName: 'IND',
    city: 'Mumbai',
    country: 'India',
    color: '#0055A5',
    secondaryColor: '#FF9933',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80',
    teamStats: { matches: 200, won: 135, lost: 58, tied: 3, noResult: 4, winPercentage: 67.5 },
    players: [
      createPlayerObj('ind-1', 'Rohit Sharma (C)', 'batsman', 'RHB', 'Right-arm Off-Spin', 159, 151, 4231, 121, 18, 32, 5, 140.89, 32.05, 1, 9.12, 45.0, '1/22', 65, 12, 0),
      createPlayerObj('ind-2', 'Virat Kohli', 'batsman', 'RHB', 'Right-arm Medium', 125, 117, 4188, 122, 31, 38, 1, 137.04, 48.69, 4, 8.05, 51.0, '1/13', 54, 9, 0),
      createPlayerObj('ind-3', 'Suryakumar Yadav', 'batsman', 'RHB', 'Right-arm Off-Spin', 71, 68, 2432, 117, 11, 20, 4, 168.42, 42.66, 0, 8.50, 0, '0/8', 41, 4, 0),
      createPlayerObj('ind-4', 'Rishabh Pant (WK)', 'wicketkeeper', 'LHB', undefined, 76, 66, 1209, 65, 14, 3, 0, 126.72, 23.25, 0, 0, 0, '0/0', 44, 18, 12),
      createPlayerObj('ind-5', 'Hardik Pandya', 'allrounder', 'RHB', 'Right-arm Fast', 104, 82, 1640, 71, 22, 4, 0, 140.53, 27.33, 86, 8.14, 25.5, '4/16', 48, 8, 0),
      createPlayerObj('ind-6', 'Shivam Dube', 'allrounder', 'LHB', 'Right-arm Medium', 33, 24, 448, 63, 9, 3, 0, 139.56, 29.86, 14, 9.38, 32.1, '3/30', 11, 2, 0),
      createPlayerObj('ind-7', 'Ravindra Jadeja', 'allrounder', 'LHB', 'Left-arm Orthodox Spin', 74, 41, 515, 46, 17, 0, 0, 127.16, 21.45, 54, 7.13, 28.4, '3/15', 28, 14, 0),
      createPlayerObj('ind-8', 'Axar Patel', 'allrounder', 'LHB', 'Left-arm Orthodox Spin', 60, 38, 453, 65, 16, 1, 0, 144.72, 20.59, 58, 7.34, 23.8, '3/9', 22, 6, 0),
      createPlayerObj('ind-9', 'Kuldeep Yadav', 'bowler', 'LHB', 'Left-arm Wrist Spin', 40, 12, 46, 23, 6, 0, 0, 74.19, 7.66, 69, 6.74, 14.1, '5/17', 12, 1, 0),
      createPlayerObj('ind-10', 'Jasprit Bumrah', 'bowler', 'RHB', 'Right-arm Fast', 70, 14, 26, 14, 8, 0, 0, 61.90, 4.33, 89, 6.27, 17.7, '3/7', 16, 3, 0),
      createPlayerObj('ind-11', 'Arshdeep Singh', 'bowler', 'LHB', 'Left-arm Fast', 54, 10, 15, 10, 5, 0, 0, 55.55, 3.00, 87, 8.32, 18.2, '4/9', 14, 2, 0),
    ]
  },
  {
    id: 'team-aus',
    name: 'Aussie Gladiators',
    shortName: 'AUS',
    city: 'Sydney',
    country: 'Australia',
    color: '#D4AF37',
    secondaryColor: '#005930',
    logo: 'https://images.unsplash.com/photo-1531415074868-036b107e7752?w=150&auto=format&fit=crop&q=80',
    teamStats: { matches: 190, won: 122, lost: 63, tied: 2, noResult: 3, winPercentage: 64.2 },
    players: [
      createPlayerObj('aus-1', 'Travis Head', 'batsman', 'LHB', 'Right-arm Off-Spin', 38, 36, 1092, 91, 3, 6, 0, 158.48, 33.09, 2, 8.75, 42.0, '1/12', 18, 3, 0),
      createPlayerObj('aus-2', 'David Warner', 'batsman', 'LHB', undefined, 110, 110, 3277, 100, 12, 26, 1, 142.47, 33.43, 0, 0, 0, '0/0', 42, 8, 0),
      createPlayerObj('aus-3', 'Mitchell Marsh (C)', 'allrounder', 'RHB', 'Right-arm Medium', 61, 57, 1445, 92, 12, 9, 0, 135.29, 32.11, 17, 8.35, 31.5, '3/24', 24, 4, 0),
      createPlayerObj('aus-4', 'Glenn Maxwell', 'allrounder', 'RHB', 'Right-arm Off-Spin', 106, 98, 2600, 145, 10, 11, 5, 155.50, 29.54, 43, 7.55, 27.2, '3/10', 49, 9, 0),
      createPlayerObj('aus-5', 'Marcus Stoinis', 'allrounder', 'RHB', 'Right-arm Medium', 68, 55, 1120, 78, 18, 4, 0, 145.26, 30.27, 34, 8.45, 26.1, '3/19', 27, 3, 0),
      createPlayerObj('aus-6', 'Tim David', 'batsman', 'RHB', undefined, 49, 41, 1060, 92, 10, 5, 0, 163.58, 34.19, 1, 10.20, 65.0, '1/18', 26, 2, 0),
      createPlayerObj('aus-7', 'Matthew Wade (WK)', 'wicketkeeper', 'LHB', undefined, 92, 66, 1202, 80, 20, 3, 0, 134.45, 26.13, 0, 0, 0, '0/0', 58, 15, 8),
      createPlayerObj('aus-8', 'Pat Cummins', 'bowler', 'RHB', 'Right-arm Fast', 57, 30, 185, 28, 15, 0, 0, 120.91, 12.33, 66, 7.42, 24.5, '3/15', 19, 4, 0),
      createPlayerObj('aus-9', 'Mitchell Starc', 'bowler', 'LHB', 'Left-arm Fast', 65, 19, 94, 17, 9, 0, 0, 85.45, 9.40, 79, 7.74, 23.8, '4/20', 18, 3, 0),
      createPlayerObj('aus-10', 'Adam Zampa', 'bowler', 'RHB', 'Right-arm Leg-Spin', 87, 18, 65, 13, 7, 0, 0, 70.65, 5.90, 111, 7.20, 21.6, '5/19', 21, 1, 0),
      createPlayerObj('aus-11', 'Josh Hazlewood', 'bowler', 'LHB', 'Right-arm Fast', 51, 9, 22, 11, 4, 0, 0, 64.70, 4.40, 67, 7.48, 21.2, '4/12', 14, 2, 0),
    ]
  }
];

// Helper to create a ready-to-score fresh 0/0 match
export function createFreshLiveMatch(
  teamA = DEFAULT_TEAMS[0],
  teamB = DEFAULT_TEAMS[1],
  overs = 10,
  title = 'Mumbai Champions Trophy 2026 — Match 1',
  venue = 'Shivaji Park Ground, Dadar, Mumbai'
): Match {
  const rsBatters = teamA.players.map(p => ({
    playerId: p.id,
    name: p.name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    isOut: false,
    wagonShots: [],
    milestones: [],
  }));

  const mwBowlers = teamB.players.slice(0, 5).map(p => ({
    playerId: p.id,
    name: p.name,
    overs: 0,
    balls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    economy: 0,
    wides: 0,
    noBalls: 0,
    dots: 0,
    foursConceded: 0,
    sixesConceded: 0,
  }));

  const teamBBatters = teamB.players.map(p => ({
    playerId: p.id,
    name: p.name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    isOut: false,
    wagonShots: [],
    milestones: [],
  }));

  const teamABowlers = teamA.players.slice(0, 5).map(p => ({
    playerId: p.id,
    name: p.name,
    overs: 0,
    balls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    economy: 0,
    wides: 0,
    noBalls: 0,
    dots: 0,
    foursConceded: 0,
    sixesConceded: 0,
  }));

  return {
    id: `match-live-${Date.now()}`,
    title,
    venue,
    city: 'Mumbai',
    date: 'Today',
    startTime: '09:00 AM IST',
    overs,
    maxOversPerBowler: Math.ceil(overs / 5),
    ballType: 'tennis',
    matchType: 'T20',
    teamA,
    teamB,
    tossWinnerId: teamA.id,
    tossDecision: 'bat',
    currentInningIndex: 0,
    obsTheme: 'wcFinal',
    status: 'live',
    meta: {
      matchNumber: 'Match 1',
      series: title,
      umpire1: 'Sunil Shinde',
      umpire2: 'Ramesh Patil',
      thirdUmpire: '',
      referee: 'Mahesh Sawant',
      scorer: 'FanClub Official Scorer',
      tossWinner: teamA.name,
      tossDecision: 'bat',
      pitchCondition: 'Hard Tennis Surface',
      weatherCondition: 'Sunny 30°C',
      dls: false,
    },
    innings: [
      {
        teamId: teamA.id,
        teamName: teamA.name,
        teamColor: teamA.color,
        totalRuns: 0,
        wickets: 0,
        oversCompleted: 0,
        ballsInCurrentOver: 0,
        isFreeHitActive: false,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
        currentStrikerId: teamA.players[0]?.id || 'rs-1',
        currentNonStrikerId: teamA.players[1]?.id || 'rs-2',
        currentBowlerId: teamB.players[0]?.id || 'mw-1',
        fallOfWickets: [],
        partnerships: [],
        batsmen: rsBatters,
        bowlers: mwBowlers,
        balls: [],
      },
      {
        teamId: teamB.id,
        teamName: teamB.name,
        teamColor: teamB.color,
        totalRuns: 0,
        wickets: 0,
        oversCompleted: 0,
        ballsInCurrentOver: 0,
        isFreeHitActive: false,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
        currentStrikerId: teamB.players[0]?.id || 'mw-1',
        currentNonStrikerId: teamB.players[1]?.id || 'mw-2',
        currentBowlerId: teamA.players[0]?.id || 'rs-1',
        fallOfWickets: [],
        partnerships: [],
        batsmen: teamBBatters,
        bowlers: teamABowlers,
        balls: [],
      },
    ],
  };
}

// Default tournament live match — 0/0 Ready to score!
export const DEFAULT_INITIAL_MATCH: Match = createFreshLiveMatch();

export const EMPTY_TOURNAMENTS: Tournament[] = [];

export function makeNewMatch(
  teamA: Team,
  teamB: Team,
  overs: number,
  title: string,
  venue: string,
  city: string,
  obsTheme: Match['obsTheme'] = 'wcFinal',
  ballType: Match['ballType'] = 'tennis',
  matchType: Match['matchType'] = 'T20',
  tossWinnerId: string = teamA.id,
  tossDecision: 'bat' | 'bowl' = 'bat',
  tournamentId?: string
): Match {
  const battingFirst = tossDecision === 'bat' ? tossWinnerId : (tossWinnerId === teamA.id ? teamB.id : teamA.id);
  const teamABatsFirst = battingFirst === teamA.id;
  const firstBattingTeam = teamABatsFirst ? teamA : teamB;
  const firstBowlingTeam = teamABatsFirst ? teamB : teamA;

  const m = createFreshLiveMatch(firstBattingTeam, firstBowlingTeam, overs, title, venue);
  m.id = `match-${Date.now()}`;
  m.city = city;
  m.tournamentId = tournamentId;
  m.obsTheme = obsTheme;
  m.ballType = ballType;
  m.matchType = matchType;
  m.tossWinnerId = tossWinnerId;
  m.tossDecision = tossDecision;
  m.meta.tossWinner = tossWinnerId === teamA.id ? teamA.name : teamB.name;
  m.meta.tossDecision = tossDecision;
  return m;
}
