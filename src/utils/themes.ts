import type { ThemeConfig, ThemeId } from '../types/cricket';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  wcFinal: {
    id: 'wcFinal',
    name: 'World Cup Grand Final',
    subtitle: 'Championship Trophy Gold & Royal Stadium Blue',
    tag: 'ICC WC FINAL',
    requiresPlan: 'free',
    headerBg: 'from-blue-900 via-indigo-950 to-slate-900 text-white',
    headerText: 'text-amber-300',
    accentColor: '#2563EB',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950',
    badgeText: 'text-amber-500',
    cardBorder: 'border-blue-200/80 hover:border-amber-400',
    pitchGreen: '#1E3A8A',
  },
  asiaCup: {
    id: 'asiaCup',
    name: 'Asia Cup Prestige',
    subtitle: 'Lush Emerald Turf & Subcontinental Heritage',
    tag: 'ASIA CUP',
    requiresPlan: 'free',
    headerBg: 'from-emerald-900 via-teal-900 to-emerald-950 text-white',
    headerText: 'text-emerald-300',
    accentColor: '#059669',
    badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white',
    badgeText: 'text-emerald-600',
    cardBorder: 'border-emerald-200/80 hover:border-emerald-400',
    pitchGreen: '#059669',
  },
  cricHeroes: {
    id: 'cricHeroes',
    name: 'CricHeroes Classic',
    subtitle: 'Authentic Grass Pitch & Clean Matchboard',
    tag: 'CRIC HEROES',
    requiresPlan: 'free',
    headerBg: 'from-green-700 via-emerald-800 to-green-900 text-white',
    headerText: 'text-green-300',
    accentColor: '#16A34A',
    badgeBg: 'bg-green-600 text-white',
    badgeText: 'text-green-600',
    cardBorder: 'border-green-200 hover:border-green-400',
    pitchGreen: '#16A34A',
  },
  sunsetIPL: {
    id: 'sunsetIPL',
    name: 'Sunset Premier League',
    subtitle: 'T20 Carnival, Sunset Amber & Stadium Spotlight',
    tag: 'IPL NIGHTS',
    requiresPlan: 'pro',
    headerBg: 'from-orange-600 via-rose-700 to-indigo-950 text-white',
    headerText: 'text-orange-300',
    accentColor: '#EA580C',
    badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    badgeText: 'text-orange-600',
    cardBorder: 'border-orange-200 hover:border-orange-400',
    pitchGreen: '#EA580C',
  },
  teamCustom: {
    id: 'teamCustom',
    name: 'Dynamic Team Identity',
    subtitle: 'Auto-adapts to Batting Team Logo & Colors',
    tag: 'TEAM COLOR SYNC',
    requiresPlan: 'premium',
    headerBg: 'from-slate-900 to-slate-950 text-white',
    headerText: 'text-yellow-400',
    accentColor: '#3B82F6',
    badgeBg: 'bg-slate-800 text-white',
    badgeText: 'text-blue-500',
    cardBorder: 'border-slate-200 hover:border-blue-400',
    pitchGreen: '#0284C7',
    isCustomTeam: true,
  }
};

export function getActiveThemeStyle(themeId: ThemeId, currentBattingTeamColor?: string) {
  const baseTheme = THEMES[themeId] || THEMES.wcFinal;

  if (themeId === 'teamCustom' && currentBattingTeamColor) {
    return {
      ...baseTheme,
      accentColor: currentBattingTeamColor,
      customAccentStyle: {
        backgroundColor: currentBattingTeamColor,
        borderColor: currentBattingTeamColor,
        color: '#FFFFFF'
      },
      dynamicGradients: `linear-gradient(135deg, ${currentBattingTeamColor}dd, #0F172A)`
    };
  }

  return {
    ...baseTheme,
    customAccentStyle: {
      backgroundColor: baseTheme.accentColor,
      borderColor: baseTheme.accentColor,
      color: '#FFFFFF'
    },
    dynamicGradients: undefined
  };
}
