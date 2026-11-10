// ============================================================
// FanClub — BroadcastOverlay.tsx
// OBS Studio Browser Source overlay component.
// Mode 1 (standalone=true / ?mode=overlay): Pure TV graphic HUD, transparent bg.
// Mode 2 (standalone=false): In-app config panel with live preview + URL copy.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tv2,
  Copy,
  CheckCheck,
  Monitor,
  Palette,
  Eye,
  Info,
  Lock,
  Zap,
  Star,
  TrendingUp,
  TrendingDown,
  Crosshair,
  ChevronRight,
  CircleDot,
  Target,
  Users,
  ListOrdered,
} from 'lucide-react';
import type { Match, ObsThemeId, PlanType, BatsmanInning, BowlerInning } from '../types/cricket';
import { computeMatchPerformers } from '../utils/performers';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type GraphicMode =
  | 'scorebar'
  | 'batsmen_card'
  | 'bowler_card'
  | 'performers_card'
  | 'fow_card'
  | 'target_card';

export interface BroadcastOverlayProps {
  match: Match;
  currentPlan: PlanType;
  onOpenPlans: () => void;
  standalone?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Definitions
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeSpec {
  id: ObsThemeId;
  label: string;
  subtitle: string;
  barBg: string;
  topBg: string;
  scoreColor: string;
  accentColor: string;
  bodyBg: string;
  shimmer?: boolean;
  branding: string;
  previewTopColor: string;
  previewBodyColor: string;
}

const THEMES: Record<ObsThemeId, ThemeSpec> = {
  wcFinal: {
    id: 'wcFinal',
    label: 'ICC World Cup Final',
    subtitle: 'Grand Final Broadcast',
    barBg: 'linear-gradient(90deg, #0A1628 0%, #1a2744 50%, #0A1628 100%)',
    topBg: 'linear-gradient(90deg, #C9A227 0%, #F5D060 50%, #C9A227 100%)',
    scoreColor: '#F5D060',
    accentColor: '#C9A227',
    bodyBg: 'linear-gradient(90deg, #0A1628 0%, #1a2744 50%, #0A1628 100%)',
    shimmer: true,
    branding: '🏆 ICC WORLD CUP',
    previewTopColor: '#C9A227',
    previewBodyColor: '#0A1628',
  },
  asiaCup: {
    id: 'asiaCup',
    label: 'Asia Cup',
    subtitle: 'ACC Broadcast',
    barBg: 'linear-gradient(90deg, #0D3B2E 0%, #145a3c 50%, #0D3B2E 100%)',
    topBg: 'linear-gradient(90deg, #2ECC71 0%, #27AE60 50%, #2ECC71 100%)',
    scoreColor: '#A8F0C6',
    accentColor: '#2ECC71',
    bodyBg: 'linear-gradient(90deg, #0D3B2E 0%, #145a3c 50%, #0D3B2E 100%)',
    branding: '🌏 ACC ASIA CUP',
    previewTopColor: '#27AE60',
    previewBodyColor: '#0D3B2E',
  },
  sunsetIPL: {
    id: 'sunsetIPL',
    label: 'T20 / IPL Sunset',
    subtitle: 'Electric Night Broadcast',
    barBg: 'linear-gradient(90deg, #1a0033 0%, #2d0066 40%, #1a0033 100%)',
    topBg: 'linear-gradient(90deg, #FF6B00 0%, #FF9500 50%, #FF6B00 100%)',
    scoreColor: '#FFD700',
    accentColor: '#FF6B00',
    bodyBg: 'linear-gradient(90deg, #1a0033 0%, #2d0066 40%, #1a0033 100%)',
    branding: '⚡ T20 CRICKET LIVE',
    previewTopColor: '#FF6B00',
    previewBodyColor: '#1a0033',
  },
  teamCustom: {
    id: 'teamCustom',
    label: 'Team Color Sync',
    subtitle: 'Dynamic Team Theme',
    barBg: '#0F172A',
    topBg: '#334155', // overridden at render time with battingTeam.color
    scoreColor: '#FFFFFF',
    accentColor: '#94A3B8',
    bodyBg: '#0F172A',
    branding: '🏏 LIVE CRICKET',
    previewTopColor: '#334155',
    previewBodyColor: '#0F172A',
  },
};

const GRAPHIC_MODES: { id: GraphicMode; label: string; icon: React.ReactNode }[] = [
  { id: 'scorebar', label: 'Score Bar', icon: <Monitor size={14} /> },
  { id: 'batsmen_card', label: 'Batsmen', icon: <Zap size={14} /> },
  { id: 'bowler_card', label: 'Bowler', icon: <Crosshair size={14} /> },
  { id: 'performers_card', label: 'Performers', icon: <Star size={14} /> },
  { id: 'fow_card', label: 'FoW', icon: <ListOrdered size={14} /> },
  { id: 'target_card', label: 'Target', icon: <Target size={14} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatOvers(completed: number, balls: number): string {
  return `${completed}.${balls}`;
}

function calcCRR(runs: number, completed: number, balls: number): string {
  const totalBalls = completed * 6 + balls;
  if (totalBalls === 0) return '0.00';
  return ((runs / totalBalls) * 6).toFixed(2);
}

function calcRRR(target: number, runs: number, oversTotal: number, completed: number, balls: number): string {
  const ballsLeft = oversTotal * 6 - (completed * 6 + balls);
  const runsLeft = target - runs;
  if (ballsLeft <= 0 || runsLeft <= 0) return '0.00';
  return ((runsLeft / ballsLeft) * 6).toFixed(2);
}

function needInBalls(target: number, runs: number, oversTotal: number, completed: number, balls: number): string {
  const runsLeft = target - runs;
  const ballsLeft = oversTotal * 6 - (completed * 6 + balls);
  if (runsLeft <= 0) return 'TARGET MET';
  return `NEED ${runsLeft} IN ${ballsLeft} BALL${ballsLeft !== 1 ? 'S' : ''}`;
}

function getBatsmanSR(batsman: BatsmanInning): string {
  if (batsman.balls === 0) return '0.00';
  return ((batsman.runs / batsman.balls) * 100).toFixed(1);
}

function getBowlerFigures(bowler: BowlerInning): string {
  return `${formatOvers(bowler.overs, bowler.balls)}-${bowler.maidens}-${bowler.runsConceded}-${bowler.wickets}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer Keyframe style injection (OBS mode only, once)
// ─────────────────────────────────────────────────────────────────────────────

function useShimmerStyle() {
  useEffect(() => {
    if (document.getElementById('obs-shimmer-style')) return;
    const style = document.createElement('style');
    style.id = 'obs-shimmer-style';
    style.textContent = `
      @keyframes obsShimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      @keyframes obsPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @keyframes obsFowScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .obs-shimmer-bar::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
        background-size: 400px 100%;
        animation: obsShimmer 2.4s linear infinite;
        pointer-events: none;
      }
      .obs-live-dot {
        animation: obsPulse 1.2s ease-in-out infinite;
      }
      .obs-fow-scroll {
        animation: obsFowScroll 18s linear infinite;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components: Overlay Graphics
// ─────────────────────────────────────────────────────────────────────────────

interface OverlayGraphicProps {
  match: Match;
  themeId: ObsThemeId;
  graphicMode: GraphicMode;
  greenScreen: boolean;
  scale?: number; // 1 for OBS, 0.5 for preview
}

function OverlayGraphic({ match, themeId, graphicMode, greenScreen, scale = 1 }: OverlayGraphicProps) {
  useShimmerStyle();

  const inning = match.innings[match.currentInningIndex];
  const battingTeam =
    inning.teamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam =
    inning.teamId === match.teamA.id ? match.teamB : match.teamA;

  const theme = THEMES[themeId];

  // teamCustom: override topBg with team color
  const resolvedTopBg =
    themeId === 'teamCustom'
      ? `linear-gradient(90deg, ${battingTeam.color} 0%, ${battingTeam.secondaryColor || battingTeam.color} 100%)`
      : theme.topBg;

  const resolvedBodyBg = greenScreen
    ? '#00B140'
    : themeId === 'teamCustom'
    ? '#0F172A'
    : theme.barBg;

  // Active batsmen
  const striker = inning.batsmen.find((b) => b.playerId === inning.currentStrikerId && !b.isOut);
  const nonStriker = inning.batsmen.find((b) => b.playerId === inning.currentNonStrikerId && !b.isOut);
  // Active bowler
  const currentBowler = inning.bowlers.find((b) => b.playerId === inning.currentBowlerId);

  const overs = `${formatOvers(inning.oversCompleted, inning.ballsInCurrentOver)}/${match.overs}`;
  const scoreDisplay = `${inning.totalRuns}/${inning.wickets}`;
  const crr = calcCRR(inning.totalRuns, inning.oversCompleted, inning.ballsInCurrentOver);

  const isSecondInnings = match.currentInningIndex === 1;
  const target = inning.targetScore;
  const rrr =
    isSecondInnings && target
      ? calcRRR(target, inning.totalRuns, match.overs, inning.oversCompleted, inning.ballsInCurrentOver)
      : null;
  const needString =
    isSecondInnings && target
      ? needInBalls(target, inning.totalRuns, match.overs, inning.oversCompleted, inning.ballsInCurrentOver)
      : null;

  const performers = computeMatchPerformers(match);

  // Font scale factor for preview
  const fs = (base: number) => `${base * scale}px`;

  const containerStyle: React.CSSProperties = {
    width: scale === 1 ? '1920px' : '100%',
    fontFamily: "'Arial Black', 'Arial Bold', Impact, sans-serif",
    letterSpacing: scale === 1 ? '0.03em' : '0.02em',
    userSelect: 'none',
    position: 'relative',
  };

  const bgStyle: React.CSSProperties = {
    background: resolvedBodyBg,
  };

  // ── Scorebar ──────────────────────────────────────────────────────────────
  if (graphicMode === 'scorebar') {
    return (
      <div style={containerStyle}>
        {/* Top Bar */}
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{
            background: resolvedTopBg,
            height: scale === 1 ? 32 : 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${scale === 1 ? 24 : 12}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              color: '#000',
              fontSize: fs(scale === 1 ? 13 : 10),
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {theme.branding}
          </span>
          <span
            style={{
              color: '#000',
              fontSize: fs(scale === 1 ? 12 : 9),
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {match.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: scale === 1 ? 6 : 3 }}>
            <span
              className="obs-live-dot"
              style={{
                width: scale === 1 ? 8 : 5,
                height: scale === 1 ? 8 : 5,
                borderRadius: '50%',
                background: '#FF1744',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#000', fontSize: fs(scale === 1 ? 12 : 9), fontWeight: 900 }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Score Row */}
        <div
          style={{
            ...bgStyle,
            display: 'flex',
            alignItems: 'center',
            height: scale === 1 ? 60 : 34,
            padding: `0 ${scale === 1 ? 20 : 10}px`,
            gap: scale === 1 ? 16 : 8,
          }}
        >
          {/* Team Logo Badge */}
          <div
            style={{
              width: scale === 1 ? 44 : 24,
              height: scale === 1 ? 44 : 24,
              borderRadius: '50%',
              background: battingTeam.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.3)`,
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {battingTeam.logo ? (
              <img src={battingTeam.logo} alt={battingTeam.shortName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 11 : 7), fontWeight: 900 }}>
                {battingTeam.shortName.slice(0, 3)}
              </span>
            )}
          </div>

          {/* Team Name + Score */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: scale === 1 ? 160 : 80 }}>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: fs(scale === 1 ? 10 : 7), fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>
              {battingTeam.shortName}
            </span>
            <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 28 : 16), fontWeight: 900, lineHeight: 1.1 }}>
              {scoreDisplay}
            </span>
          </div>

          {/* Overs */}
          <div
            style={{
              borderLeft: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.15)`,
              paddingLeft: scale === 1 ? 14 : 7,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase', lineHeight: 1 }}>OV</span>
            <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 14 : 9), fontWeight: 700, lineHeight: 1.1 }}>{overs}</span>
          </div>

          {/* Divider */}
          <div style={{ flex: 1 }} />

          {/* Striker */}
          {striker && (
            <div
              style={{
                borderLeft: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.15)`,
                paddingLeft: scale === 1 ? 14 : 7,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase', lineHeight: 1 }}>
                {striker.name.split(' ').pop()}★
              </span>
              <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 14 : 9), fontWeight: 900, lineHeight: 1.1 }}>
                {striker.runs}*<span style={{ fontSize: fs(scale === 1 ? 10 : 7), fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>({striker.balls})</span>
              </span>
            </div>
          )}

          {/* Non Striker */}
          {nonStriker && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: scale === 1 ? 10 : 5 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase', lineHeight: 1 }}>
                {nonStriker.name.split(' ').pop()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 700, lineHeight: 1.1 }}>
                {nonStriker.runs}<span style={{ fontSize: fs(scale === 1 ? 9 : 6), fontWeight: 400 }}>({nonStriker.balls})</span>
              </span>
            </div>
          )}

          {/* Bowler */}
          {currentBowler && (
            <div
              style={{
                borderLeft: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.15)`,
                paddingLeft: scale === 1 ? 14 : 7,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase', lineHeight: 1 }}>
                {currentBowler.name.split(' ').pop()}
              </span>
              <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 700, lineHeight: 1.1 }}>
                {getBowlerFigures(currentBowler)}
              </span>
            </div>
          )}

          {/* Target / Need */}
          {isSecondInnings && needString && (
            <div
              style={{
                borderLeft: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.15)`,
                paddingLeft: scale === 1 ? 14 : 7,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase', lineHeight: 1 }}>TARGET {target}</span>
              <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 11 : 7), fontWeight: 900, lineHeight: 1.1 }}>{needString}</span>
            </div>
          )}

          {/* CRR / RRR */}
          <div
            style={{
              borderLeft: `${scale === 1 ? 2 : 1}px solid rgba(255,255,255,0.15)`,
              paddingLeft: scale === 1 ? 14 : 7,
              display: 'flex',
              gap: scale === 1 ? 14 : 7,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase' }}>CRR</span>
              <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 700 }}>{crr}</span>
            </div>
            {rrr && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), textTransform: 'uppercase' }}>RRR</span>
                <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 700 }}>{rrr}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Batsmen Card ─────────────────────────────────────────────────────────
  if (graphicMode === 'batsmen_card') {
    const activeBatsmen = [striker, nonStriker].filter(Boolean) as BatsmanInning[];
    return (
      <div style={containerStyle}>
        {/* Top Bar */}
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{ background: resolvedTopBg, height: scale === 1 ? 28 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${scale === 1 ? 24 : 12}px`, position: 'relative', overflow: 'hidden' }}
        >
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900, textTransform: 'uppercase' }}>AT THE CREASE</span>
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 700, textTransform: 'uppercase' }}>{battingTeam.shortName} · {scoreDisplay} ({overs})</span>
        </div>
        <div style={{ ...bgStyle, display: 'flex', gap: scale === 1 ? 2 : 1 }}>
          {activeBatsmen.map((bat, i) => (
            <div
              key={bat.playerId}
              style={{
                flex: 1,
                padding: `${scale === 1 ? 10 : 6}px ${scale === 1 ? 20 : 10}px`,
                display: 'flex',
                alignItems: 'center',
                gap: scale === 1 ? 14 : 7,
                borderRight: i === 0 ? `${scale === 1 ? 1 : 1}px solid rgba(255,255,255,0.1)` : 'none',
              }}
            >
              <div
                style={{
                  width: scale === 1 ? 36 : 20,
                  height: scale === 1 ? 36 : 20,
                  borderRadius: '50%',
                  background: battingTeam.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `${scale === 1 ? 2 : 1}px solid ${i === 0 ? theme.scoreColor : 'rgba(255,255,255,0.3)'}`,
                }}
              >
                <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 10 : 6), fontWeight: 900 }}>
                  {bat.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: scale === 1 ? 4 : 2 }}>
                  <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 11 : 7), fontWeight: 900, textTransform: 'uppercase' }}>
                    {bat.name.split(' ').pop()}{i === 0 ? '★' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: scale === 1 ? 10 : 5, marginTop: scale === 1 ? 2 : 1 }}>
                  <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 20 : 12), fontWeight: 900, lineHeight: 1 }}>
                    {bat.runs}{i === 0 ? '*' : ''}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 400, alignSelf: 'flex-end' }}>
                    ({bat.balls}b)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: scale === 1 ? 10 : 5, marginTop: scale === 1 ? 2 : 1 }}>
                  {[{ label: '4s', val: bat.fours }, { label: '6s', val: bat.sixes }, { label: 'SR', val: getBatsmanSR(bat) }].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 11 : 7), fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Bowler Card ──────────────────────────────────────────────────────────
  if (graphicMode === 'bowler_card') {
    const sortedBowlers = [...inning.bowlers].sort((a, b) => {
      if (a.playerId === inning.currentBowlerId) return -1;
      if (b.playerId === inning.currentBowlerId) return 1;
      return (b.overs * 6 + b.balls) - (a.overs * 6 + a.balls);
    });
    const displayBowlers = sortedBowlers.slice(0, 3);

    return (
      <div style={containerStyle}>
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{ background: resolvedTopBg, height: scale === 1 ? 28 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${scale === 1 ? 24 : 12}px`, position: 'relative', overflow: 'hidden' }}
        >
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900, textTransform: 'uppercase' }}>BOWLING — {bowlingTeam.shortName}</span>
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 700 }}>O-M-R-W</span>
        </div>
        <div style={{ ...bgStyle, display: 'flex', alignItems: 'stretch' }}>
          {displayBowlers.map((b, i) => {
            const isCurrent = b.playerId === inning.currentBowlerId;
            return (
              <div
                key={b.playerId}
                style={{
                  flex: i === 0 ? 1.4 : 1,
                  padding: `${scale === 1 ? 8 : 5}px ${scale === 1 ? 16 : 8}px`,
                  borderRight: i < displayBowlers.length - 1 ? `${scale === 1 ? 1 : 1}px solid rgba(255,255,255,0.1)` : 'none',
                  borderTop: isCurrent ? `${scale === 1 ? 2 : 1}px solid ${theme.accentColor}` : `${scale === 1 ? 2 : 1}px solid transparent`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: scale === 1 ? 2 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: scale === 1 ? 6 : 3 }}>
                  {isCurrent && (
                    <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 8 : 5), fontWeight: 900 }}>▶</span>
                  )}
                  <span style={{ color: isCurrent ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: fs(scale === 1 ? 11 : 7), fontWeight: isCurrent ? 900 : 700, textTransform: 'uppercase' }}>
                    {b.name.split(' ').pop()}
                  </span>
                  {isCurrent && <span style={{ color: theme.accentColor, fontSize: fs(scale === 1 ? 8 : 5), fontWeight: 900, marginLeft: 'auto' }}>NOW</span>}
                </div>
                <div style={{ display: 'flex', gap: scale === 1 ? 8 : 4, flexWrap: 'wrap' }}>
                  {[
                    { label: 'OV', val: `${b.overs}.${b.balls}` },
                    { label: 'MD', val: b.maidens },
                    { label: 'RN', val: b.runsConceded },
                    { label: 'WK', val: b.wickets },
                    { label: 'EC', val: b.economy.toFixed(1) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: fs(scale === 1 ? 7 : 5), textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ color: label === 'WK' && Number(val) > 0 ? theme.scoreColor : '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: label === 'WK' ? 900 : 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Performers Card ──────────────────────────────────────────────────────
  if (graphicMode === 'performers_card') {
    const { bestBatsman, bestBowler, manOfTheMatch } = performers;
    return (
      <div style={containerStyle}>
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{ background: resolvedTopBg, height: scale === 1 ? 28 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${scale === 1 ? 24 : 12}px`, position: 'relative', overflow: 'hidden' }}
        >
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900, textTransform: 'uppercase' }}>⭐ MATCH PERFORMERS</span>
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 700 }}>{match.title}</span>
        </div>
        <div style={{ ...bgStyle, display: 'flex' }}>
          {/* MVP */}
          {manOfTheMatch && (
            <div style={{ flex: 1.2, padding: `${scale === 1 ? 8 : 5}px ${scale === 1 ? 16 : 8}px`, borderRight: `${scale === 1 ? 1 : 1}px solid rgba(255,255,255,0.1)` }}>
              <div style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 8 : 5), fontWeight: 900, textTransform: 'uppercase', marginBottom: scale === 1 ? 2 : 1 }}>🏆 MVP</div>
              <div style={{ color: '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 900, textTransform: 'uppercase' }}>{manOfTheMatch.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: fs(scale === 1 ? 9 : 6) }}>{manOfTheMatch.team} · {manOfTheMatch.performance}</div>
              <div style={{ color: theme.accentColor, fontSize: fs(scale === 1 ? 10 : 6), fontWeight: 900, marginTop: scale === 1 ? 2 : 1 }}>{manOfTheMatch.points} PTS</div>
            </div>
          )}
          {/* Best Bat */}
          {bestBatsman && (
            <div style={{ flex: 1, padding: `${scale === 1 ? 8 : 5}px ${scale === 1 ? 14 : 7}px`, borderRight: `${scale === 1 ? 1 : 1}px solid rgba(255,255,255,0.1)` }}>
              <div style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 8 : 5), fontWeight: 900, textTransform: 'uppercase', marginBottom: scale === 1 ? 2 : 1 }}>🏏 BEST BAT</div>
              <div style={{ color: '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 900, textTransform: 'uppercase' }}>{bestBatsman.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: fs(scale === 1 ? 9 : 6) }}>{bestBatsman.team}</div>
              <div style={{ display: 'flex', gap: scale === 1 ? 8 : 4, marginTop: scale === 1 ? 3 : 2 }}>
                <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 18 : 11), fontWeight: 900 }}>{bestBatsman.runs}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 11 : 7), alignSelf: 'flex-end' }}>({bestBatsman.balls}b)</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), alignSelf: 'flex-end' }}>SR {bestBatsman.strikeRate.toFixed(1)}</span>
              </div>
            </div>
          )}
          {/* Best Bowl */}
          {bestBowler && (
            <div style={{ flex: 1, padding: `${scale === 1 ? 8 : 5}px ${scale === 1 ? 14 : 7}px` }}>
              <div style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 8 : 5), fontWeight: 900, textTransform: 'uppercase', marginBottom: scale === 1 ? 2 : 1 }}>⚡ BEST BOWL</div>
              <div style={{ color: '#fff', fontSize: fs(scale === 1 ? 13 : 8), fontWeight: 900, textTransform: 'uppercase' }}>{bestBowler.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: fs(scale === 1 ? 9 : 6) }}>{bestBowler.team}</div>
              <div style={{ display: 'flex', gap: scale === 1 ? 8 : 4, marginTop: scale === 1 ? 3 : 2 }}>
                <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 18 : 11), fontWeight: 900 }}>{bestBowler.wickets}/{bestBowler.runsConceded}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(scale === 1 ? 9 : 6), alignSelf: 'flex-end' }}>EC {bestBowler.economy.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Fall of Wickets Card ─────────────────────────────────────────────────
  if (graphicMode === 'fow_card') {
    const fowItems = inning.fallOfWickets;
    const fowText = fowItems.length > 0
      ? fowItems.map((f) => `${f.wicketNumber}-${f.score} (${f.batsmanName}, ${f.overs} ov)`).join('   •   ')
      : 'No wickets fallen yet';

    return (
      <div style={containerStyle}>
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{ background: resolvedTopBg, height: scale === 1 ? 28 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${scale === 1 ? 24 : 12}px`, position: 'relative', overflow: 'hidden' }}
        >
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900, textTransform: 'uppercase' }}>FALL OF WICKETS — {battingTeam.shortName}</span>
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 700 }}>{scoreDisplay} ({overs})</span>
        </div>
        <div style={{ ...bgStyle, padding: `${scale === 1 ? 8 : 5}px ${scale === 1 ? 24 : 12}px`, overflow: 'hidden', height: scale === 1 ? 44 : 26, display: 'flex', alignItems: 'center' }}>
          <div className={fowItems.length > 3 ? 'obs-fow-scroll' : ''} style={{ display: 'flex', alignItems: 'center', gap: scale === 1 ? 24 : 12 }}>
            <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 10 : 6.5), fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {fowText}
              {fowItems.length > 3 && (
                <span style={{ opacity: 0 }}>   {fowText}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Target Card ──────────────────────────────────────────────────────────
  if (graphicMode === 'target_card') {
    const prevInning = match.innings[0];
    const firstTeam = prevInning.teamId === match.teamA.id ? match.teamA : match.teamB;

    return (
      <div style={containerStyle}>
        <div
          className={theme.shimmer ? 'obs-shimmer-bar' : ''}
          style={{ background: resolvedTopBg, height: scale === 1 ? 28 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${scale === 1 ? 24 : 12}px`, position: 'relative', overflow: 'hidden' }}
        >
          <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900, textTransform: 'uppercase' }}>🎯 CHASE TRACKER</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: scale === 1 ? 6 : 3 }}>
            <span className="obs-live-dot" style={{ width: scale === 1 ? 7 : 4, height: scale === 1 ? 7 : 4, borderRadius: '50%', background: '#FF1744', display: 'inline-block' }} />
            <span style={{ color: '#000', fontSize: fs(scale === 1 ? 11 : 8), fontWeight: 900 }}>LIVE</span>
          </div>
        </div>
        <div style={{ ...bgStyle, display: 'flex', alignItems: 'center', padding: `${scale === 1 ? 6 : 4}px ${scale === 1 ? 24 : 12}px`, gap: scale === 1 ? 24 : 12 }}>
          {/* Set by */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>SET BY</span>
            <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 14 : 9), fontWeight: 900 }}>{firstTeam.shortName}</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: fs(scale === 1 ? 11 : 7) }}>{prevInning.totalRuns}/{prevInning.wickets}</span>
          </div>
          <div style={{ width: scale === 1 ? 1 : 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />
          {/* Target */}
          {target ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>TARGET</span>
              <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 32 : 20), fontWeight: 900, lineHeight: 1 }}>{target}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>1st INNINGS</span>
              <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 24 : 15), fontWeight: 900, lineHeight: 1 }}>IN PROGRESS</span>
            </div>
          )}
          <div style={{ width: scale === 1 ? 1 : 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />
          {/* Chasing */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>CHASING — {battingTeam.shortName}</span>
            <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 14 : 9), fontWeight: 900 }}>{scoreDisplay} ({overs})</span>
            {isSecondInnings && target && needString && (
              <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 11 : 7), fontWeight: 900, marginTop: scale === 1 ? 2 : 1 }}>{needString}</span>
            )}
          </div>
          {/* CRR / RRR */}
          {isSecondInnings && (
            <>
              <div style={{ width: scale === 1 ? 1 : 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />
              <div style={{ display: 'flex', gap: scale === 1 ? 16 : 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>CRR</span>
                  <span style={{ color: '#fff', fontSize: fs(scale === 1 ? 16 : 10), fontWeight: 900 }}>{crr}</span>
                </div>
                {rrr && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: fs(scale === 1 ? 8 : 5), textTransform: 'uppercase' }}>RRR</span>
                    <span style={{ color: theme.scoreColor, fontSize: fs(scale === 1 ? 16 : 10), fontWeight: 900 }}>{rrr}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Selector Card
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeCardProps {
  spec: ThemeSpec;
  selected: boolean;
  onClick: () => void;
  battingTeamColor?: string;
  battingTeamSecondaryColor?: string;
}

function ThemeCard({ spec, selected, onClick, battingTeamColor, battingTeamSecondaryColor }: ThemeCardProps) {
  const resolvedTop =
    spec.id === 'teamCustom' && battingTeamColor
      ? `linear-gradient(90deg, ${battingTeamColor} 0%, ${battingTeamSecondaryColor || battingTeamColor} 100%)`
      : spec.topBg;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col overflow-hidden rounded-lg border-2 transition-all duration-150 cursor-pointer text-left w-full ${
        selected ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Mini color preview */}
      <div className="h-8 w-full relative overflow-hidden" style={{ background: spec.bodyBg }}>
        <div className="absolute top-0 left-0 right-0 h-2 relative overflow-hidden" style={{ background: resolvedTop }}>
          {spec.shimmer && (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              }}
            />
          )}
        </div>
        <div className="absolute bottom-1 left-2 right-2 h-3 rounded-sm opacity-80" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="absolute bottom-1.5 left-3 h-2 w-10 rounded-sm" style={{ background: spec.scoreColor }} />
      </div>
      <div className="bg-white/5 px-2 py-1.5">
        <div className="text-white text-xs font-bold leading-tight truncate">{spec.label}</div>
        <div className="text-white/50 text-xs leading-tight truncate">{spec.subtitle}</div>
      </div>
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center">
          <CheckCheck size={9} className="text-white" />
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BroadcastOverlay({ match, currentPlan, onOpenPlans, standalone = false }: BroadcastOverlayProps) {
  // Derive theme from match.obsTheme as default
  const [selectedTheme, setSelectedTheme] = useState<ObsThemeId>(match.obsTheme ?? 'wcFinal');
  const [graphicMode, setGraphicMode] = useState<GraphicMode>('scorebar');
  const [greenScreen, setGreenScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const isPremium = currentPlan === 'premium';

  const obsUrl = `${window.location.origin}/?mode=overlay&theme=${selectedTheme}&matchId=${match.id}`;

  const inning = match.innings[match.currentInningIndex];
  const battingTeam = inning.teamId === match.teamA.id ? match.teamA : match.teamB;

  const handleCopyUrl = useCallback(() => {
    if (!isPremium) {
      onOpenPlans();
      return;
    }
    navigator.clipboard.writeText(obsUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [obsUrl, isPremium, onOpenPlans]);

  // ── STANDALONE MODE (OBS Browser Source) ──────────────────────────────────
  if (standalone) {
    // Parse theme from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = (urlParams.get('theme') as ObsThemeId) ?? match.obsTheme ?? 'wcFinal';

    return (
      <div
        style={{
          width: '1920px',
          minHeight: '1080px',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
        }}
      >
        {/* OBS overlay sits at the bottom (lower third) */}
        <div style={{ width: '100%' }}>
          <OverlayGraphic
            match={match}
            themeId={urlTheme}
            graphicMode={graphicMode}
            greenScreen={false}
            scale={1}
          />
        </div>
      </div>
    );
  }

  // ── APP CONFIG MODE ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Tv2 size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">OBS Broadcast Overlay</h2>
          <p className="text-white/50 text-xs leading-tight">TV-quality graphics for live streaming via OBS Studio Browser Source</p>
        </div>
        {!isPremium && (
          <div className="ml-auto flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1">
            <Lock size={11} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">Premium</span>
          </div>
        )}
      </div>

      {/* ── Theme Selector ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-white/60" />
          <span className="text-white/80 text-sm font-semibold">OBS Theme</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(Object.values(THEMES) as ThemeSpec[]).map((spec) => (
            <ThemeCard
              key={spec.id}
              spec={spec}
              selected={selectedTheme === spec.id}
              onClick={() => setSelectedTheme(spec.id)}
              battingTeamColor={battingTeam.color}
              battingTeamSecondaryColor={battingTeam.secondaryColor}
            />
          ))}
        </div>
      </div>

      {/* ── Graphic Mode Tabs ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-white/60" />
          <span className="text-white/80 text-sm font-semibold">Graphic Mode</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GRAPHIC_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setGraphicMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                graphicMode === mode.id
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/25'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>

        {/* Green Screen Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-white/70 text-xs">Chroma Key / Green Screen Background</span>
          </div>
          <button
            onClick={() => setGreenScreen((p) => !p)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
              greenScreen ? 'bg-green-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                greenScreen ? 'left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-white/60" />
          <span className="text-white/80 text-sm font-semibold">Live Preview</span>
          <span className="text-white/35 text-xs ml-auto">~50% scale · 1920×92px equivalent</span>
        </div>
        <div
          ref={previewRef}
          className="w-full overflow-hidden rounded-lg"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* 16:9 aspect ratio wrapper for the lower third */}
          <div style={{ position: 'relative', width: '100%' }}>
            <OverlayGraphic
              match={match}
              themeId={selectedTheme}
              graphicMode={graphicMode}
              greenScreen={greenScreen}
              scale={0.5}
            />
          </div>
        </div>
        <p className="text-white/30 text-xs">
          Preview reflects current live match data. The actual overlay auto-updates in real time via OBS Browser Source.
        </p>
      </div>

      {/* ── OBS URL + Instructions ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Tv2 size={14} className="text-white/60" />
          <span className="text-white/80 text-sm font-semibold">OBS Browser Source URL</span>
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white/50 overflow-hidden text-ellipsis whitespace-nowrap select-all"
            title={obsUrl}
          >
            {isPremium ? obsUrl : obsUrl.replace(window.location.origin, '••••••••••••')}
          </div>
          <button
            onClick={handleCopyUrl}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex-shrink-0 ${
              !isPremium
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : copied
                ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : 'bg-sky-500/20 border border-sky-500/40 text-sky-400 hover:bg-sky-500/30'
            }`}
          >
            {!isPremium ? (
              <>
                <Lock size={12} />
                Unlock
              </>
            ) : copied ? (
              <>
                <CheckCheck size={12} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy URL
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Info size={12} className="text-sky-400 flex-shrink-0" />
            <span className="text-white/70 text-xs font-semibold">How to add to OBS Studio</span>
          </div>
          <ol className="space-y-1.5 ml-4">
            {[
              'Open OBS Studio and select your Scene',
              'Click the + button in the Sources panel',
              'Choose Browser Source from the list',
              'Paste the copied URL into the URL field',
              'Set Width: 1920  ·  Height: 1080',
              'Enable "Shutdown source when not visible" for performance',
              'Click OK — the overlay will appear live!',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-white/50 text-xs leading-relaxed">
                <span className="text-sky-500 font-bold flex-shrink-0 w-3">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Premium gate */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Lock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-xs font-bold leading-tight">Premium Feature</p>
                <p className="text-amber-200/60 text-xs leading-relaxed mt-0.5">
                  OBS Browser Source URLs require a Premium plan. Upgrade to unlock TV-quality broadcast overlays.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPlans}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
            >
              Upgrade
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── Stats overview bar (teaser when not premium) ── */}
      {!isPremium && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <CircleDot size={14} className="text-sky-400" />, label: '6 Graphic Modes', desc: 'Score bar, batsmen, bowler, FOW & more' },
            { icon: <TrendingUp size={14} className="text-green-400" />, label: 'Real-time Updates', desc: 'Auto-refreshes from live scoring' },
            { icon: <Users size={14} className="text-purple-400" />, label: '4 Pro Themes', desc: 'ICC, Asia Cup, IPL & team-branded' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-white/[0.03] border border-white/8 rounded-xl p-3 space-y-1">
              {icon}
              <p className="text-white/80 text-xs font-bold leading-tight">{label}</p>
              <p className="text-white/40 text-xs leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
