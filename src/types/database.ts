// ============================================================
// FAN CLUB — Relational Database Schema & Store Interfaces
// ============================================================
import type { Player, Team, Club, Match, Tournament, Venue } from './cricket';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clubId?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'suspended';
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'club_manager'
  | 'team_manager'
  | 'match_scorer'
  | 'player'
  | 'fan'
  | 'streamer';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'player' | 'team' | 'club' | 'match' | 'tournament' | 'migration' | 'obs' | 'user';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface DataProviderRecord {
  id: string;
  name: string;
  providerType: 'cricHeroes' | 'sportmonks' | 'cricketData' | 'highlightly' | 'custom';
  type?: string;
  endpointUrl?: string;
  apiKey?: string;
  apiEndpoint?: string;
  authHeader?: string;
  rateLimitPerMinute: number;
  lastSyncTimestamp?: string;
  lastCheckedAt?: string;
  latencyMs?: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  status?: string;
  lastErrorMessage?: string;
  recordsImportedTotal?: number;
}

export interface ObsOverlayToken {
  id: string;
  token: string;
  matchId: string;
  themeId: string;
  name: string;
  createdAt: string;
  expiresAt?: string;
  isRevoked: boolean;
  allowedOrigins?: string[];
  lastAccessedAt?: string;
}

export interface FanClubDatabaseSchema {
  users: User[];
  players: Player[];
  playerExternalIds: Record<string, { fanClubId: string; providerId: string; provider: string }>;
  teams: Team[];
  clubs: Club[];
  matches: Match[];
  tournaments: Tournament[];
  venues: Venue[];
  obsTokens: ObsOverlayToken[];
  dataProviders: DataProviderRecord[];
  auditLogs: AuditLogEntry[];
}
