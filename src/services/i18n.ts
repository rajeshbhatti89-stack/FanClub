// ============================================================
// FAN CLUB — Multi-Language Localization System (EN & HI)
// ============================================================

export type LanguageCode = 'en' | 'hi';

export const TRANSLATIONS = {
  en: {
    appTitle: 'FAN CLUB',
    appSubtitle: 'Global Cricket Platform & OBS Broadcast Engine',
    scoringPad: 'Live Scorer',
    liveMatches: 'Live Cricket',
    cricHeroesMigration: 'CricHeroes Sync',
    playerDatabase: 'Players',
    teamsClubs: 'Clubs & Teams',
    tournaments: 'Tournaments',
    obsOverlays: 'OBS Overlays',
    community: 'Community',
    analytics: 'Rankings & Stats',
    adminPanel: 'Admin Hub',
    newMatch: 'New Match',
    liveMatchBadge: 'LIVE MATCH',
    targetNeed: 'Need',
    runsIn: 'runs in',
    balls: 'balls',
    crr: 'CRR',
    rrr: 'RRR',
    manOfTheMatch: 'Player of the Match',
    bestBatsman: 'Best Batsman',
    bestBowler: 'Best Bowler',
    startNewMatch: 'Start Match',
    createTournament: 'Create Tournament',
    importCricHeroes: 'Import CricHeroes',
    searchPlaceholder: 'Search players, teams, matches or clubs...',
    changeLanguage: 'Switch to Hindi (हिंदी)',
  },
  hi: {
    appTitle: 'फैन क्लब (FAN CLUB)',
    appSubtitle: 'वैश्विक क्रिकेट मंच एवं ओबीएस ब्रॉडकास्ट इंजन',
    scoringPad: 'लाइव स्कोरर',
    liveMatches: 'लाइव क्रिकेट',
    cricHeroesMigration: 'क्रिकहीरोज़ सिंक',
    playerDatabase: 'खिलाड़ी',
    teamsClubs: 'क्लब व टीमें',
    tournaments: 'टूर्नामेंट',
    obsOverlays: 'ओबीएस ओवरले',
    community: 'कम्युनिटी',
    analytics: 'रैंकिंग एवं आँकड़े',
    adminPanel: 'प्रशासन केंद्र',
    newMatch: 'नया मैच',
    liveMatchBadge: 'लाइव मैच',
    targetNeed: 'जीत के लिए चाहिए',
    runsIn: 'रन शेष',
    balls: 'गेंदों में',
    crr: 'वर्तमान रन रेट',
    rrr: 'आवश्यक रन रेट',
    manOfTheMatch: 'प्लेयर ऑफ द मैच (MVP)',
    bestBatsman: 'सर्वश्रेष्ठ बल्लेबाज',
    bestBowler: 'सर्वश्रेष्ठ गेंदबाज',
    startNewMatch: 'नया मैच शुरू करें',
    createTournament: 'टूर्नामेंट बनाएँ',
    importCricHeroes: 'क्रिकहीरोज़ डेटा माइग्रेट करें',
    searchPlaceholder: 'खिलाड़ी, टीम, मैच या क्लब खोजें...',
    changeLanguage: 'Switch to English',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

export function getTranslation(lang: LanguageCode, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || (key as string);
}

export const i18nService = {
  t: (key: TranslationKey, lang: LanguageCode = 'en') => getTranslation(lang, key),
  getTranslation,
};
