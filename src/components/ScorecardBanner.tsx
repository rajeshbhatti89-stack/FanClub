import React, { useMemo } from 'react';
import type { Match, ObsThemeId, MatchPerformers } from '../types/cricket';
import { computeMatchPerformers } from '../utils/performers';
import {
  Trophy,
  Target,
  Zap,
  MapPin,
  Tv2,
  Star,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface ScorecardBannerProps {
  match: Match;
  currentObsTheme: ObsThemeId;
}

// ─────────────────────────────────────────────
// Theme config
// ─────────────────────────────────────────────
interface ThemeConfig {
  strip: string;        // top strip bg
  stripText: string;    // top strip text
  accent: string;       // left border accent (Tailwind class)
  bg: string;           // banner body bg
  badgeBg: string;      // LIVE / info badge bg
  liveDot: string;      // pulsing dot color
  scoreText: string;    // big score text color
  subText: string;      // sub-label text color
  cardBorder: string;   // performer card border
}

function getTheme(themeId: ObsThemeId, battingTeamColor?: string): ThemeConfig {
  switch (themeId) {
    case 'wcFinal':
      return {
        strip: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800',
        stripText: 'text-amber-300',
        accent: 'border-l-4 border-amber-400',
        bg: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900',
        badgeBg: 'bg-blue-800',
        liveDot: 'bg-red-500',
        scoreText: 'text-white',
        subText: 'text-blue-200',
        cardBorder: 'border-blue-700',
      };
    case 'asiaCup':
      return {
        strip: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-700',
        stripText: 'text-green-200',
        accent: 'border-l-4 border-emerald-400',
        bg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900',
        badgeBg: 'bg-teal-700',
        liveDot: 'bg-red-400',
        scoreText: 'text-white',
        subText: 'text-emerald-200',
        cardBorder: 'border-teal-700',
      };
    case 'sunsetIPL':
      return {
        strip: 'bg-gradient-to-r from-orange-700 via-rose-700 to-orange-600',
        stripText: 'text-amber-100',
        accent: 'border-l-4 border-orange-400',
        bg: 'bg-gradient-to-br from-orange-950 via-rose-950 to-slate-900',
        badgeBg: 'bg-orange-700',
        liveDot: 'bg-yellow-400',
        scoreText: 'text-white',
        subText: 'text-orange-200',
        cardBorder: 'border-orange-700',
      };
    case 'teamCustom':
    default: {
      // Dynamic based on batting team color — inline style used below
      return {
        strip: 'bg-gray-900',               // overridden via style
        stripText: 'text-white',
        accent: 'border-l-4 border-white',  // overridden via style
        bg: 'bg-gray-950',                  // overridden via style
        badgeBg: 'bg-gray-700',             // overridden via style
        liveDot: 'bg-red-500',
        scoreText: 'text-white',
        subText: 'text-gray-300',
        cardBorder: 'border-gray-700',      // overridden via style
      };
    }
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatOvers(completed: number, balls: number): string {
  return `${completed}.${balls}`;
}

function formatScore(runs: number, wickets: number, overs: number, balls: number): string {
  return `${runs}/${wickets}`;
}

function calcCRR(runs: number, completed: number, balls: number): string {
  const totalBalls = completed * 6 + balls;
  if (totalBalls === 0) return '0.00';
  return ((runs / totalBalls) * 6).toFixed(2);
}

function calcRRR(target: number, runs: number, completed: number, balls: number, maxOvers: number): string {
  const totalBalls = completed * 6 + balls;
  const ballsLeft = maxOvers * 6 - totalBalls;
  if (ballsLeft <= 0) return '—';
  const runsNeeded = target - runs;
  if (runsNeeded <= 0) return '0.00';
  return ((runsNeeded / ballsLeft) * 6).toFixed(2);
}

// hex → rgb for tinted backgrounds
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface TeamPanelProps {
  team: { name: string; shortName: string; logo?: string; color: string };
  score?: string;         // e.g. "123/4"
  overs?: string;         // e.g. "(18.3 ov)"
  isBatting: boolean;
  tossWon: boolean;
  tossDecision: 'bat' | 'bowl';
  align: 'left' | 'right';
  subTextClass: string;
}

function TeamPanel({
  team,
  score,
  overs,
  isBatting,
  tossWon,
  tossDecision,
  align,
  subTextClass,
}: TeamPanelProps) {
  const isRight = align === 'right';
  return (
    <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} gap-1 min-w-0`}>
      {/* Logo + Name */}
      <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.shortName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-white/20"
            style={{ backgroundColor: team.color }}
          >
            {team.shortName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
          <span className="text-white font-bold text-sm leading-tight truncate max-w-28">
            {team.shortName}
          </span>
          <span className={`text-xs truncate max-w-28 ${subTextClass}`}>{team.name}</span>
        </div>
      </div>

      {/* Score */}
      {score ? (
        <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
          <span
            className={`font-extrabold leading-none ${
              isBatting ? 'text-white text-2xl' : 'text-white/70 text-xl'
            }`}
          >
            {score}
          </span>
          {overs && (
            <span className={`text-xs mt-0.5 ${subTextClass}`}>{overs}</span>
          )}
        </div>
      ) : (
        <span className={`text-xs italic ${subTextClass}`}>Yet to bat</span>
      )}

      {/* Toss indicator */}
      {tossWon && (
        <span className="text-xs bg-white/10 text-white/80 rounded px-1.5 py-0.5">
          Won toss · {tossDecision === 'bat' ? '🏏 Bat' : '🎯 Bowl'}
        </span>
      )}

      {/* Batting indicator */}
      {isBatting && (
        <span
          className="text-xs font-semibold rounded px-1.5 py-0.5 text-white"
          style={{ backgroundColor: team.color }}
        >
          ● Batting
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Performer Card
// ─────────────────────────────────────────────
interface PerformerCardProps {
  icon: React.ReactNode;
  label: string;
  gradientClass: string;
  borderClass: string;
  name: string;
  team: string;
  stat: string;
  badge?: string | number;
  badgeColor?: string;
}

function PerformerCard({
  icon,
  label,
  gradientClass,
  borderClass,
  name,
  team,
  stat,
  badge,
  badgeColor,
}: PerformerCardProps) {
  return (
    <div className={`rounded-xl p-3 border ${borderClass} ${gradientClass} flex flex-col gap-1.5 min-w-0`}>
      <div className="flex items-center gap-1.5">
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wide truncate">
          {label}
        </span>
        {badge !== undefined && (
          <span
            className="ml-auto text-xs font-bold text-white px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: badgeColor ?? '#d97706' }}
          >
            {badge} pts
          </span>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-white font-bold text-sm leading-tight truncate">{name}</span>
        <span className="text-white/60 text-xs truncate">{team}</span>
        <span className="text-white/90 text-xs font-mono mt-0.5 truncate">{stat}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ScorecardBanner({ match, currentObsTheme }: ScorecardBannerProps) {
  const performers: MatchPerformers = useMemo(
    () => computeMatchPerformers(match),
    [match]
  );

  const isLive = match.status === 'live';
  const isInningsBreak = match.status === 'innings_break';
  const isCompleted = match.status === 'completed';

  const currentInning = match.innings[match.currentInningIndex];
  const isSecondInning = match.currentInningIndex === 1;

  // Which team is batting in the current inning
  const battingTeamId = currentInning.teamId;
  const battingTeam = match.teamA.id === battingTeamId ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.id === battingTeamId ? match.teamB : match.teamA;

  const teamABatting = match.innings[0].teamId === match.teamA.id;
  // Inning for teamA is innings[0] if teamA batted first, else innings[1]
  const teamAInningIdx = teamABatting ? 0 : 1;
  const teamBInningIdx = teamABatting ? 1 : 0;

  const teamAInning = match.innings[teamAInningIdx];
  const teamBInning = match.innings[teamBInningIdx];

  // Has teamB batted at all?
  const teamBHasBatted =
    isSecondInning || isInningsBreak || isCompleted
      ? teamBInning.oversCompleted > 0 ||
        teamBInning.ballsInCurrentOver > 0 ||
        teamBInning.totalRuns > 0
      : false;

  // Scores
  const teamAScore = formatScore(
    teamAInning.totalRuns,
    teamAInning.wickets,
    teamAInning.oversCompleted,
    teamAInning.ballsInCurrentOver
  );
  const teamAOvers = `(${formatOvers(teamAInning.oversCompleted, teamAInning.ballsInCurrentOver)} ov)`;

  const teamBScore = teamBHasBatted
    ? formatScore(
        teamBInning.totalRuns,
        teamBInning.wickets,
        teamBInning.oversCompleted,
        teamBInning.ballsInCurrentOver
      )
    : undefined;
  const teamBOvers = teamBHasBatted
    ? `(${formatOvers(teamBInning.oversCompleted, teamBInning.ballsInCurrentOver)} ov)`
    : undefined;

  // CRR / RRR
  const crr = calcCRR(
    currentInning.totalRuns,
    currentInning.oversCompleted,
    currentInning.ballsInCurrentOver
  );
  const rrr =
    isSecondInning && currentInning.targetScore
      ? calcRRR(
          currentInning.targetScore,
          currentInning.totalRuns,
          currentInning.oversCompleted,
          currentInning.ballsInCurrentOver,
          match.overs
        )
      : null;

  // Target pill
  const targetPill =
    isSecondInning && currentInning.targetScore
      ? `Need ${currentInning.targetScore - currentInning.totalRuns} off ${
          match.overs * 6 -
          (currentInning.oversCompleted * 6 + currentInning.ballsInCurrentOver)
        } balls`
      : null;

  // ── Theme ──────────────────────────────────
  const theme = getTheme(currentObsTheme, battingTeam.color);
  const isCustomTheme = currentObsTheme === 'teamCustom';
  const rgb = isCustomTheme ? hexToRgb(battingTeam.color) : null;

  const customStripStyle: React.CSSProperties = isCustomTheme && rgb
    ? { background: `linear-gradient(to right, rgb(${rgb.r * 0.3},${rgb.g * 0.3},${rgb.b * 0.3}), rgb(${rgb.r * 0.2},${rgb.g * 0.2},${rgb.b * 0.2}))` }
    : {};
  const customBgStyle: React.CSSProperties = isCustomTheme && rgb
    ? { background: `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.08), rgba(0,0,0,0.95))` }
    : {};
  const customAccentStyle: React.CSSProperties = isCustomTheme
    ? { borderLeftColor: battingTeam.color }
    : {};
  const customBadgeStyle: React.CSSProperties = isCustomTheme && rgb
    ? { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)` }
    : {};

  // ── Toss ──────────────────────────────────
  const teamATossWon = match.tossWinnerId === match.teamA.id;
  const teamBTossWon = match.tossWinnerId === match.teamB.id;

  // ── Status label ──────────────────────────
  let statusLabel = '';
  if (isInningsBreak) statusLabel = 'Innings Break';
  else if (isCompleted) statusLabel = match.winDescription ?? 'Match Completed';
  else if (match.status === 'abandoned') statusLabel = 'Match Abandoned';
  else if (match.status === 'upcoming') statusLabel = 'Upcoming';

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
        isCustomTheme ? '' : theme.bg
      }`}
      style={isCustomTheme ? customBgStyle : {}}
    >
      {/* ── Top Strip ───────────────────────── */}
      <div
        className={`${isCustomTheme ? '' : theme.strip} px-4 py-2 flex items-center justify-between gap-2`}
        style={isCustomTheme ? customStripStyle : {}}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tv2 size={13} className={`shrink-0 ${theme.stripText}`} />
          <span className={`text-xs font-semibold truncate ${theme.stripText}`}>
            {match.meta.series || match.title}
          </span>
          <span className={`hidden sm:inline text-xs ${theme.stripText} opacity-60`}>·</span>
          <div className={`hidden sm:flex items-center gap-1 text-xs ${theme.stripText} opacity-70`}>
            <MapPin size={10} className="shrink-0" />
            <span className="truncate max-w-40">{match.venue}</span>
          </div>
          <span className={`hidden sm:inline text-xs ${theme.stripText} opacity-60`}>·</span>
          <span className={`hidden sm:inline text-xs ${theme.stripText} opacity-70`}>
            {match.matchType} · {match.overs} ov
          </span>
        </div>

        {/* LIVE badge or status */}
        <div className="shrink-0">
          {isLive ? (
            <span
              className="flex items-center gap-1.5 text-xs font-bold text-white px-2 py-0.5 rounded-full"
              style={isCustomTheme ? customBadgeStyle : {}}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${theme.liveDot}`}
              />
              <span className={isCustomTheme ? '' : `${theme.badgeBg} rounded-full px-2 py-0.5`}>
                LIVE
              </span>
            </span>
          ) : (
            <span
              className={`text-xs font-medium text-white/70 px-2 py-0.5 rounded-full ${
                isCustomTheme ? '' : theme.badgeBg
              }`}
              style={isCustomTheme ? customBadgeStyle : {}}
            >
              {match.status === 'upcoming' ? '🕐 Upcoming' : match.status === 'completed' ? '✅ Completed' : match.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* ── Score Body ──────────────────────── */}
      <div
        className={`px-4 pt-4 pb-3 border-l-4 ${isCustomTheme ? '' : theme.accent.replace('border-l-4 ', '')}`}
        style={
          isCustomTheme
            ? { borderLeftColor: battingTeam.color, borderLeftWidth: '4px', borderLeftStyle: 'solid' }
            : {}
        }
      >
        <div className="flex items-stretch justify-between gap-2">
          {/* Team A */}
          <TeamPanel
            team={match.teamA}
            score={teamAInning.oversCompleted > 0 || teamAInning.ballsInCurrentOver > 0 || teamAInning.totalRuns > 0 ? teamAScore : undefined}
            overs={teamAInning.oversCompleted > 0 || teamAInning.ballsInCurrentOver > 0 ? teamAOvers : undefined}
            isBatting={battingTeamId === match.teamA.id && (isLive || isInningsBreak)}
            tossWon={teamATossWon}
            tossDecision={match.tossDecision}
            align="left"
            subTextClass={theme.subText}
          />

          {/* Center Hub */}
          <div className="flex flex-col items-center justify-center gap-1 px-2 min-w-0 flex-1">
            {/* Big score of the active innings */}
            <div className="flex flex-col items-center">
              <span
                className={`font-black leading-none tracking-tight ${theme.scoreText}`}
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
              >
                {currentInning.totalRuns}/{currentInning.wickets}
              </span>
              <span className={`text-xs mt-0.5 font-medium ${theme.subText}`}>
                {formatOvers(currentInning.oversCompleted, currentInning.ballsInCurrentOver)} ov
              </span>
            </div>

            {/* CRR / RRR badges */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {(isLive || isInningsBreak) && (
                <span className="text-xs bg-blue-900/60 text-blue-200 font-mono px-2 py-0.5 rounded-full border border-blue-700/40">
                  CRR {crr}
                </span>
              )}
              {rrr && isLive && (
                <span className="text-xs bg-orange-900/60 text-orange-200 font-mono px-2 py-0.5 rounded-full border border-orange-700/40">
                  RRR {rrr}
                </span>
              )}
            </div>

            {/* Target equation pill */}
            {targetPill && (isLive || isInningsBreak) && (
              <span className="text-xs bg-white/10 text-white/80 font-medium px-3 py-1 rounded-full border border-white/20 text-center">
                {targetPill}
              </span>
            )}

            {/* Result text */}
            {(isCompleted || match.status === 'abandoned') && (
              <span className="text-xs text-green-300 font-semibold text-center leading-tight px-2">
                {statusLabel}
              </span>
            )}

            {/* VS divider for upcoming */}
            {match.status === 'upcoming' && (
              <span className={`text-lg font-black ${theme.subText}`}>VS</span>
            )}
          </div>

          {/* Team B */}
          <TeamPanel
            team={match.teamB}
            score={teamBHasBatted ? teamBScore : undefined}
            overs={teamBHasBatted ? teamBOvers : undefined}
            isBatting={battingTeamId === match.teamB.id && (isLive || isInningsBreak)}
            tossWon={teamBTossWon}
            tossDecision={match.tossDecision}
            align="right"
            subTextClass={theme.subText}
          />
        </div>
      </div>

      {/* ── Performers Ribbon ───────────────── */}
      {(performers.manOfTheMatch || performers.bestBatsman || performers.bestBowler) && (
        <div className={`px-4 pb-4 pt-1 border-t border-white/10`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} className="text-amber-400" />
            <span className="text-xs text-white/50 font-semibold uppercase tracking-widest">
              Match Performers
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Man of the Match */}
            {performers.manOfTheMatch ? (
              <PerformerCard
                icon={<Trophy size={13} className="text-amber-300" />}
                label="Man of the Match"
                gradientClass="bg-gradient-to-br from-amber-950/80 to-yellow-950/60"
                borderClass={`border-amber-700/50 ${theme.cardBorder}`}
                name={performers.manOfTheMatch.name}
                team={performers.manOfTheMatch.team}
                stat={performers.manOfTheMatch.performance}
                badge={performers.manOfTheMatch.points}
                badgeColor="#d97706"
              />
            ) : (
              <div className="hidden sm:block" />
            )}

            {/* Best Batsman */}
            {performers.bestBatsman ? (
              <PerformerCard
                icon={<Zap size={13} className="text-sky-300" />}
                label="Best Batsman"
                gradientClass="bg-gradient-to-br from-blue-950/80 to-cyan-950/60"
                borderClass="border-sky-700/50"
                name={performers.bestBatsman.name}
                team={performers.bestBatsman.team}
                stat={`${performers.bestBatsman.runs}(${performers.bestBatsman.balls}) · ${performers.bestBatsman.fours}×4 ${performers.bestBatsman.sixes}×6 · SR ${performers.bestBatsman.strikeRate.toFixed(1)}`}
              />
            ) : (
              <div className="hidden sm:block" />
            )}

            {/* Best Bowler */}
            {performers.bestBowler ? (
              <PerformerCard
                icon={<Target size={13} className="text-emerald-300" />}
                label="Best Bowler"
                gradientClass="bg-gradient-to-br from-emerald-950/80 to-teal-950/60"
                borderClass="border-emerald-700/50"
                name={performers.bestBowler.name}
                team={performers.bestBowler.team}
                stat={`${performers.bestBowler.wickets}/${performers.bestBowler.runsConceded} (${performers.bestBowler.overs} ov) · Eco ${performers.bestBowler.economy.toFixed(2)}`}
              />
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
