// ============================================================
// FAN CLUB — OBS Studio Streaming Overlay Service
// Tokenized Browser Source URLs, TV Graphic Theme Specifications,
// Broadcast Animations & Real-time Stream Sync.
// ============================================================
import type { ObsThemeId, Match } from '../types/cricket';
import type { ObsOverlayToken } from '../types/database';
import { db } from '../db/database';

export interface ObsThemeMetadata {
  id: ObsThemeId;
  name: string;
  tagline: string;
  category: 'World Cup' | 'Asia Cup' | 'IPL Sunset' | 'Test Classic' | 'Dynamic Team';
  previewBadgeColor: string;
  description: string;
}

export const OBS_THEMES_CATALOG: ObsThemeMetadata[] = [
  {
    id: 'wcFinal',
    name: 'ICC World Cup Grand Final TV Ribbon',
    tagline: 'Deep navy, gold metallic chrome, official ICC trophy badge',
    category: 'World Cup',
    previewBadgeColor: '#0A1628',
    description: 'Broadcast-grade lower-third ribbon inspired by the ICC Men\'s World Championship Grand Final broadcast.',
  },
  {
    id: 'asiaCup',
    name: 'Asia Cup Prestige TV Ribbon',
    tagline: 'Emerald green & teal gradient, ACC tournament crest',
    category: 'Asia Cup',
    previewBadgeColor: '#0D3B2E',
    description: 'Prestige Asian Cricket Council broadcast graphic with emerald glow and high-contrast statistics.',
  },
  {
    id: 'sunsetIPL',
    name: 'T20 Premier Sunset Ribbon',
    tagline: 'Electric orange-purple gradient, franchise carnival HUD',
    category: 'IPL Sunset',
    previewBadgeColor: '#FF6B00',
    description: 'High-energy franchise cricket aesthetic matching Indian Premier League primetime broadcast graphics.',
  },
  {
    id: 'testClassic',
    name: 'Test Cricket Heritage HUD',
    tagline: 'Classic cream, forest green & gold accents',
    category: 'Test Classic',
    previewBadgeColor: '#1F2937',
    description: 'Clean, understated traditional scoreboard lower-third for red-ball and longer format broadcasts.',
  },
  {
    id: 'teamCustom',
    name: 'Dynamic Team Identity Sync',
    tagline: 'Auto-morphs to batting team official colors & crest',
    category: 'Dynamic Team',
    previewBadgeColor: '#2563EB',
    description: 'Automatically synchronizes graphic palette to batting team colors and uploaded logo.',
  },
];

export class ObsOverlayService {
  public generateBrowserSourceUrl(token: string, mode: 'overlay' | 'scorebar' | 'scorecard' | 'alerts' = 'overlay'): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fanclub.srijandev.in';
    return `${origin}/?mode=${mode}&token=${token}`;
  }

  public createTokenForMatch(matchId: string, themeId: ObsThemeId, name: string): ObsOverlayToken {
    return db.createObsToken(matchId, themeId, name);
  }

  public getTokensForMatch(matchId: string): ObsOverlayToken[] {
    return db.getObsTokens().filter(t => t.matchId === matchId && !t.isRevoked);
  }

  public resolveToken(tokenString: string): { token: ObsOverlayToken; match: Match } | null {
    const token = db.getObsTokens().find(t => t.token === tokenString && !t.isRevoked);
    if (!token) return null;
    const match = db.getMatchById(token.matchId);
    if (!match) return null;
    return { token, match };
  }
}

export const obsOverlayService = new ObsOverlayService();
