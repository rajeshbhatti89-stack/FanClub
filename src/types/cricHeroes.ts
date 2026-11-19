// ============================================================
// FAN CLUB — CricHeroes Migration & Integration Types
// ============================================================
import type { Player, PlayerRole, BattingStyle, BowlingStyle } from './cricket';

export interface CricHeroesRawPlayer {
  cricheroes_id?: string | number;
  player_id?: string | number;
  id?: string | number;
  name?: string;
  player_name?: string;
  full_name?: string;
  country?: string;
  state?: string;
  city?: string;
  playing_role?: string;
  role?: string;
  batting_style?: string;
  bowling_style?: string;
  date_of_birth?: string;
  profile_photo?: string;
  avatar?: string;
  matches?: number;
  innings?: number;
  runs?: number;
  highest_score?: number;
  fifties?: number;
  hundreds?: number;
  strike_rate?: number;
  batting_average?: number;
  wickets?: number;
  bowling_economy?: number;
  best_bowling?: string;
  catches?: number;
  run_outs?: number;
  stumpings?: number;
  team_name?: string;
  team_names?: string[];
  teams?: string | string[];
  tournaments?: string | string[];
  career_stats?: {
    matches?: number;
    innings?: number;
    runs?: number;
    highest_score?: number;
    not_outs?: number;
    fifties?: number;
    hundreds?: number;
    strike_rate?: number;
    batting_average?: number;
    wickets?: number;
    bowling_economy?: number;
    best_bowling?: string;
    catches?: number;
    stumpings?: number;
    run_outs?: number;
  };
}

export interface CricHeroesDuplicateCandidate {
  id: string;
  existingPlayer: Player;
  incomingRecord: CricHeroesRawPlayer;
  confidenceScore: number; // 0 - 100%
  matchedFields: string[];
  divergentFields: string[];
  status: 'pending' | 'merged' | 'rejected' | 'created_as_new';
  resolvedAt?: string;
}

export interface CricHeroesMigrationJob {
  id: string;
  title: string;
  sourceType: 'official_api' | 'authorized_csv' | 'authorized_json' | 'public_dataset';
  startedAt: string;
  completedAt?: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  importedCount: number;
  updatedCount: number;
  duplicateCount: number;
  failedCount: number;
  duplicateCandidates: CricHeroesDuplicateCandidate[];
  errorLog: Array<{ recordId: string; error: string; timestamp: string }>;
  licenseAttribution: string;
}

export interface CricHeroesMigrationReport {
  jobId: string;
  generatedAt: string;
  totalProcessed: number;
  successfulImports: number;
  updatesMerged: number;
  duplicatesFlagged: number;
  failures: number;
  complianceNotice: string;
}
