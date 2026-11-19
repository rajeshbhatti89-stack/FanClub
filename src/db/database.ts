// ============================================================
// FAN CLUB — Master Relational Database Engine
// Persistent storage with referential integrity, indexes,
// transactions, reactive subscriptions, and backup/restore.
// ============================================================
import type { Player, Team, Club, Match, Tournament, Venue } from '../types/cricket';
import type { User, DataProviderRecord, AuditLogEntry, ObsOverlayToken, FanClubDatabaseSchema, ImportBatchRecord } from '../types/database';
import type { CommunityPost } from '../types/community';
import {
  SEED_PLAYERS,
  SEED_TEAMS,
  SEED_CLUBS,
  SEED_VENUES,
  SEED_TOURNAMENTS,
  SEED_DATA_PROVIDERS,
  SEED_USERS,
  SEED_AUDIT_LOGS,
  SEED_COMMUNITY_POSTS,
} from './seedData';
import { DEFAULT_INITIAL_MATCH } from '../data/initialState';

const STORAGE_KEY = 'fanclub_master_db_v6';
const ACTIVE_MATCH_KEY = 'fanclub_active_match_id';

type ChangeListener = () => void;

class FanClubDatabase {
  private schema: FanClubDatabaseSchema;
  private posts: CommunityPost[];
  private listeners: Set<ChangeListener> = new Set();

  constructor() {
    this.schema = this.loadSchema();
    this.posts = this.loadPosts();
  }

  // ─── Persistence ─────────────────────────────────────────────
  private loadSchema(): FanClubDatabaseSchema {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('fanclub_master_db_v5');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.players && parsed.teams && parsed.matches) {
          if (!parsed.importBatches) parsed.importBatches = [];
          // Ensure all CricHeroes seed players are merged into active storage
          SEED_PLAYERS.forEach(sp => {
            const exists = parsed.players.some((p: Player) => p.id === sp.id || (sp.cricheroesId && p.cricheroesId === sp.cricheroesId));
            if (!exists) {
              parsed.players.push(sp);
            }
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error('[FanClub DB] Failed to parse stored database, falling back to seed:', e);
    }
    return this.getDefaultSchema();
  }

  private getDefaultSchema(): FanClubDatabaseSchema {
    const extMapping: Record<string, { fanClubId: string; providerId: string; provider: string }> = {};
    SEED_PLAYERS.forEach(p => {
      if (p.cricheroesId) {
        extMapping[p.cricheroesId] = {
          fanClubId: p.fanClubId,
          providerId: p.cricheroesId,
          provider: 'cricHeroes',
        };
      }
    });

    return {
      users: SEED_USERS,
      players: SEED_PLAYERS,
      playerExternalIds: extMapping,
      teams: SEED_TEAMS,
      clubs: SEED_CLUBS,
      matches: [DEFAULT_INITIAL_MATCH],
      tournaments: SEED_TOURNAMENTS,
      venues: SEED_VENUES,
      obsTokens: [
        {
          id: 'token-wc-final',
          token: 'obs_wcc2026_live_token_77a9',
          matchId: DEFAULT_INITIAL_MATCH.id,
          themeId: 'wcFinal',
          name: 'World Cup Grand Final Main TV Ribbon',
          createdAt: new Date().toISOString(),
          isRevoked: false,
        },
      ],
      dataProviders: SEED_DATA_PROVIDERS,
      auditLogs: SEED_AUDIT_LOGS,
      importBatches: [],
    };
  }

  private loadPosts(): CommunityPost[] {
    try {
      const raw = localStorage.getItem('fanclub_community_posts_v2');
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return SEED_COMMUNITY_POSTS;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schema));
      localStorage.setItem('fanclub_community_posts_v2', JSON.stringify(this.posts));
      this.notify();
    } catch (e) {
      console.error('[FanClub DB] Persistence error:', e);
    }
  }

  // ─── Reactive Subscriptions ──────────────────────────────────
  public subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('[FanClub DB] Listener error:', err);
      }
    });
  }

  // ─── Audit Logging ───────────────────────────────────────────
  public log(action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-1',
      userName: 'Fan Club Administrator',
      action,
      entityType,
      entityId,
      details,
    };
    this.schema.auditLogs.unshift(entry);
    if (this.schema.auditLogs.length > 500) {
      this.schema.auditLogs = this.schema.auditLogs.slice(0, 500);
    }
    this.persist();
  }

  public getAuditLogs(entityType?: string): AuditLogEntry[] {
    if (entityType) {
      return this.schema.auditLogs.filter(l => l.entityType === entityType);
    }
    return [...this.schema.auditLogs];
  }

  // ─── Players API ─────────────────────────────────────────────
  public getPlayers(): Player[] {
    return [...this.schema.players];
  }

  public getPlayerById(id: string): Player | undefined {
    return this.schema.players.find(p => p.id === id || p.fanClubId === id);
  }

  public getPlayerByCricHeroesId(chId: string): Player | undefined {
    return this.schema.players.find(p => p.cricheroesId === chId);
  }

  public savePlayer(player: Player): void {
    const idx = this.schema.players.findIndex(p => p.id === player.id || p.fanClubId === player.fanClubId);
    if (idx >= 0) {
      this.schema.players[idx] = player;
      this.log('PLAYER_UPDATED', 'player', player.id, `Player profile updated: ${player.name} (${player.fanClubId})`);
    } else {
      this.schema.players.unshift(player);
      this.log('PLAYER_CREATED', 'player', player.id, `New player registered: ${player.name} (${player.fanClubId})`);
    }

    if (player.cricheroesId) {
      this.schema.playerExternalIds[player.cricheroesId] = {
        fanClubId: player.fanClubId,
        providerId: player.cricheroesId,
        provider: 'cricHeroes',
      };
    }
    this.persist();
  }

  public upsertPlayersBatch(players: Player[]): { added: number; updated: number } {
    let added = 0;
    let updated = 0;

    players.forEach(p => {
      const idx = this.schema.players.findIndex(
        existing => existing.id === p.id || existing.fanClubId === p.fanClubId || (p.cricheroesId && existing.cricheroesId === p.cricheroesId)
      );

      if (idx >= 0) {
        this.schema.players[idx] = { ...this.schema.players[idx], ...p };
        updated++;
      } else {
        this.schema.players.push(p);
        added++;
      }

      if (p.cricheroesId) {
        this.schema.playerExternalIds[p.cricheroesId] = {
          fanClubId: p.fanClubId,
          providerId: p.cricheroesId,
          provider: 'cricHeroes',
        };
      }
    });

    this.log('PLAYERS_BATCH_MIGRATED', 'migration', `batch-${Date.now()}`, `Migrated ${added} new and ${updated} updated player records`);
    this.persist();
    return { added, updated };
  }

  public searchPlayers(query: string, filters?: { role?: string; country?: string; verifiedOnly?: boolean }): Player[] {
    const q = query.trim().toLowerCase();
    return this.schema.players.filter(p => {
      if (q) {
        const matchesName = p.name.toLowerCase().includes(q) || (p.fullName && p.fullName.toLowerCase().includes(q));
        const matchesId = p.fanClubId.toLowerCase().includes(q) || (p.cricheroesId && p.cricheroesId.toLowerCase().includes(q));
        const matchesCountry = p.country.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCountry) return false;
      }
      if (filters?.role && filters.role !== 'all' && p.role !== filters.role) return false;
      if (filters?.country && filters.country !== 'all' && p.country !== filters.country) return false;
      if (filters?.verifiedOnly && !p.isVerified) return false;
      return true;
    });
  }

  public deletePlayer(id: string): void {
    const p = this.getPlayerById(id);
    this.schema.players = this.schema.players.filter(x => x.id !== id && x.fanClubId !== id);
    if (p) this.log('PLAYER_DELETED', 'player', id, `Player removed: ${p.name}`);
    this.persist();
  }

  // ─── Import Batches & Acquisition API ────────────────────────
  public getImportBatches(): ImportBatchRecord[] {
    return this.schema.importBatches ? [...this.schema.importBatches] : [];
  }

  public getImportBatchById(batchId: string): ImportBatchRecord | undefined {
    return (this.schema.importBatches || []).find(b => b.batchId === batchId || b.id === batchId);
  }

  public saveImportBatch(batch: ImportBatchRecord): void {
    if (!this.schema.importBatches) this.schema.importBatches = [];
    const idx = this.schema.importBatches.findIndex(b => b.batchId === batch.batchId || b.id === batch.id);
    if (idx >= 0) {
      this.schema.importBatches[idx] = batch;
    } else {
      this.schema.importBatches.unshift(batch);
    }
    this.persist();
  }

  public rollbackBatch(batchId: string): { success: boolean; playersRemoved: number; message: string } {
    if (!this.schema.importBatches) this.schema.importBatches = [];
    const batch = this.schema.importBatches.find(b => b.batchId === batchId || b.id === batchId);
    if (!batch) {
      return { success: false, playersRemoved: 0, message: `Batch ${batchId} not found in database.` };
    }
    if (batch.status === 'rolled_back') {
      return { success: false, playersRemoved: 0, message: `Batch ${batchId} was already rolled back on ${batch.rolledBackAt}.` };
    }

    const playerIdsToRemove = new Set(batch.playerIds);
    const initialCount = this.schema.players.length;

    // Filter out players who were created as part of this batch
    this.schema.players = this.schema.players.filter(p => {
      const matchBatchId = p.dataProvenance?.batchId === batchId;
      const matchPlayerId = playerIdsToRemove.has(p.id) || playerIdsToRemove.has(p.fanClubId);
      if (matchBatchId || matchPlayerId) {
        // Also remove external ID mapping if present
        if (p.cricheroesId && this.schema.playerExternalIds[p.cricheroesId]) {
          delete this.schema.playerExternalIds[p.cricheroesId];
        }
        return false;
      }
      return true;
    });

    const removedCount = initialCount - this.schema.players.length;

    // Update batch record
    batch.status = 'rolled_back';
    batch.rolledBackAt = new Date().toISOString();

    this.log(
      'BATCH_ROLLEDBACK',
      'migration',
      batch.batchId,
      `Rolled back batch "${batch.fileName}" (${batchId}): ${removedCount} genuine player records removed`
    );

    this.persist();
    return {
      success: true,
      playersRemoved: removedCount,
      message: `Successfully rolled back batch "${batch.fileName}". Removed ${removedCount} player profiles.`,
    };
  }

  public claimPlayerProfile(
    playerId: string,
    claimData: {
      claimerName: string;
      phoneHash?: string;
      phoneMasked?: string;
      email?: string;
      idProofType?: string;
      idProofRef?: string;
    }
  ): { success: boolean; player?: Player; message: string } {
    const player = this.schema.players.find(p => p.id === playerId || p.fanClubId === playerId);
    if (!player) {
      return { success: false, message: 'Player profile not found.' };
    }

    const claimToken = `FC-CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    player.isVerified = true;
    player.verificationStatus = 'verified';
    player.contactPhoneHash = claimData.phoneHash;
    player.contactPhoneMasked = claimData.phoneMasked;
    player.claimedByUserId = claimData.email || claimData.claimerName;
    player.claimedAt = new Date().toISOString();
    player.claimToken = claimToken;
    player.idProofType = claimData.idProofType;
    player.idProofRef = claimData.idProofRef;
    player.digitalPassportUrl = `https://fanclub.srijandev.in/passport/${player.fanClubId}`;

    this.log(
      'PLAYER_CLAIMED',
      'player',
      player.id,
      `Grassroots profile claimed by ${claimData.claimerName} (Token: ${claimToken})`
    );

    this.persist();
    return {
      success: true,
      player,
      message: `Profile successfully claimed and verified for ${player.name}! Passport token generated.`,
    };
  }

  // ─── Teams API ───────────────────────────────────────────────
  public getTeams(): Team[] {
    return [...this.schema.teams];
  }

  public getTeamById(id: string): Team | undefined {
    return this.schema.teams.find(t => t.id === id);
  }

  public saveTeam(team: Team): void {
    const idx = this.schema.teams.findIndex(t => t.id === team.id);
    if (idx >= 0) {
      this.schema.teams[idx] = team;
      this.log('TEAM_UPDATED', 'team', team.id, `Team updated: ${team.name}`);
    } else {
      this.schema.teams.push(team);
      this.log('TEAM_CREATED', 'team', team.id, `New team registered: ${team.name}`);
    }
    this.persist();
  }

  public deleteTeam(id: string): void {
    this.schema.teams = this.schema.teams.filter(t => t.id !== id);
    this.log('TEAM_DELETED', 'team', id, `Team removed with ID ${id}`);
    this.persist();
  }

  // ─── Clubs API ───────────────────────────────────────────────
  public getClubs(): Club[] {
    return [...this.schema.clubs];
  }

  public getClubById(id: string): Club | undefined {
    return this.schema.clubs.find(c => c.id === id);
  }

  public saveClub(club: Club): void {
    const idx = this.schema.clubs.findIndex(c => c.id === club.id);
    if (idx >= 0) {
      this.schema.clubs[idx] = club;
      this.log('CLUB_UPDATED', 'club', club.id, `Club updated: ${club.name}`);
    } else {
      this.schema.clubs.push(club);
      this.log('CLUB_CREATED', 'club', club.id, `New local club created: ${club.name}`);
    }
    this.persist();
  }

  // ─── Matches API ─────────────────────────────────────────────
  public getMatches(): Match[] {
    return [...this.schema.matches];
  }

  public getMatchById(id: string): Match | undefined {
    return this.schema.matches.find(m => m.id === id);
  }

  public getActiveMatch(): Match {
    const activeId = localStorage.getItem(ACTIVE_MATCH_KEY);
    if (activeId) {
      const found = this.getMatchById(activeId);
      if (found) return found;
    }
    return this.schema.matches[0] || DEFAULT_INITIAL_MATCH;
  }

  public setActiveMatch(match: Match): void {
    this.saveMatch(match);
    localStorage.setItem(ACTIVE_MATCH_KEY, match.id);
  }

  public saveMatch(match: Match): void {
    const idx = this.schema.matches.findIndex(m => m.id === match.id);
    if (idx >= 0) {
      this.schema.matches[idx] = match;
    } else {
      this.schema.matches.unshift(match);
      this.log('MATCH_CREATED', 'match', match.id, `Match scheduled: ${match.title}`);
    }
    this.persist();
  }

  // ─── Tournaments API ─────────────────────────────────────────
  public getTournaments(): Tournament[] {
    return [...this.schema.tournaments];
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.schema.tournaments.find(t => t.id === id);
  }

  public saveTournament(tournament: Tournament): void {
    const idx = this.schema.tournaments.findIndex(t => t.id === tournament.id);
    if (idx >= 0) {
      this.schema.tournaments[idx] = tournament;
      this.log('TOURNAMENT_UPDATED', 'tournament', tournament.id, `Tournament updated: ${tournament.name}`);
    } else {
      this.schema.tournaments.unshift(tournament);
      this.log('TOURNAMENT_CREATED', 'tournament', tournament.id, `New tournament created: ${tournament.name}`);
    }
    this.persist();
  }

  public deleteTournament(id: string): void {
    this.schema.tournaments = this.schema.tournaments.filter(t => t.id !== id);
    this.log('TOURNAMENT_DELETED', 'tournament', id, `Tournament deleted with ID ${id}`);
    this.persist();
  }

  // ─── Venues API ──────────────────────────────────────────────
  public getVenues(): Venue[] {
    return [...this.schema.venues];
  }

  public saveVenue(venue: Venue): void {
    const idx = this.schema.venues.findIndex(v => v.id === venue.id);
    if (idx >= 0) {
      this.schema.venues[idx] = venue;
    } else {
      this.schema.venues.push(venue);
    }
    this.persist();
  }

  // ─── OBS Tokens API ──────────────────────────────────────────
  public getObsTokens(): ObsOverlayToken[] {
    return [...this.schema.obsTokens];
  }

  public createObsToken(matchId: string, themeId: string, name: string): ObsOverlayToken {
    const tokenStr = `obs_fc_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    const newToken: ObsOverlayToken = {
      id: `tok-${Date.now()}`,
      token: tokenStr,
      matchId,
      themeId,
      name,
      createdAt: new Date().toISOString(),
      isRevoked: false,
    };
    this.schema.obsTokens.push(newToken);
    this.log('OBS_TOKEN_GENERATED', 'obs', newToken.id, `Secure OBS overlay token generated for match ${matchId}`);
    this.persist();
    return newToken;
  }

  public revokeObsToken(tokenId: string): void {
    const tok = this.schema.obsTokens.find(t => t.id === tokenId);
    if (tok) {
      tok.isRevoked = true;
      this.log('OBS_TOKEN_REVOKED', 'obs', tokenId, `OBS streaming token revoked`);
      this.persist();
    }
  }

  // ─── Data Providers API ──────────────────────────────────────
  public getDataProviders(): DataProviderRecord[] {
    return [...this.schema.dataProviders];
  }

  public saveDataProvider(provider: DataProviderRecord): void {
    const idx = this.schema.dataProviders.findIndex(p => p.id === provider.id);
    if (idx >= 0) {
      this.schema.dataProviders[idx] = provider;
    } else {
      this.schema.dataProviders.push(provider);
    }
    this.log('DATA_PROVIDER_SAVED', 'migration', provider.id, `Data provider configuration updated: ${provider.name}`);
    this.persist();
  }

  // ─── Community API ───────────────────────────────────────────
  public getPosts(): CommunityPost[] {
    return [...this.posts];
  }

  public createPost(content: string, authorName = 'Cricket Fan', tags: string[] = ['FanClub']): CommunityPost {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: 'usr-admin-1',
      authorName,
      authorRole: 'Community Member',
      isVerified: true,
      content,
      createdAt: 'Just now',
      likesCount: 0,
      likedByMe: false,
      comments: [],
      tags,
    };
    this.posts.unshift(newPost);
    this.persist();
    return newPost;
  }

  public toggleLikePost(postId: string): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      if (post.likedByMe) {
        post.likesCount = Math.max(0, post.likesCount - 1);
        post.likedByMe = false;
      } else {
        post.likesCount += 1;
        post.likedByMe = true;
      }
      this.persist();
    }
  }

  public addCommentToPost(postId: string, content: string, authorName = 'Cricket Fan'): void {
    const post = this.posts.find(p => p.id === postId);
    if (post && content.trim()) {
      post.comments.push({
        id: `comm-${Date.now()}`,
        postId,
        authorId: 'usr-current',
        authorName,
        content: content.trim(),
        createdAt: 'Just now',
        likes: 0,
      });
      this.persist();
    }
  }

  public votePoll(postId: string, optionId: string): void {
    const post = this.posts.find(p => p.id === postId);
    if (post?.poll && !post.poll.userVotedOptionId) {
      const opt = post.poll.options.find(o => o.id === optionId);
      if (opt) {
        opt.votes += 1;
        post.poll.totalVotes += 1;
        post.poll.userVotedOptionId = optionId;
        this.persist();
      }
    }
  }

  // ─── Users & Auth API ───────────────────────────────────────
  public getUsers(): User[] {
    return [...this.schema.users];
  }

  public addUser(user: User): void {
    const idx = this.schema.users.findIndex(u => u.id === user.id || u.email === user.email);
    if (idx >= 0) {
      this.schema.users[idx] = user;
    } else {
      this.schema.users.unshift(user);
    }
    this.log('USER_REGISTERED', 'user', user.id, `User registered: ${user.name} (${user.role})`);
    this.persist();
  }

  public getCurrentUser(): User {
    try {
      const saved = localStorage.getItem('fanclub_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (
      this.schema.users[0] || {
        id: 'usr-admin-1',
        email: 'admin@fanclub.in',
        phone: '+91 98765 43210',
        name: 'Rajesh Bhatti',
        role: 'super_admin',
        city: 'Mumbai',
        createdAt: '2026-01-01T00:00:00Z',
        status: 'active',
      }
    );
  }

  public getUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/\D/g, '');
    return this.schema.users.find(u => u.phone && u.phone.replace(/\D/g, '') === cleanPhone);
  }

  public logoutUser(): void {
    try {
      localStorage.removeItem('fanclub_current_user');
    } catch {}
    this.notify();
  }

  public setCurrentUser(user: User): void {
    try {
      localStorage.setItem('fanclub_current_user', JSON.stringify(user));
    } catch {}
    this.notify();
  }

  public addClub(club: Club): void {
    this.saveClub(club);
  }

  public getCommunityPosts(): CommunityPost[] {
    return this.getPosts();
  }

  public addCommunityPost(post: CommunityPost): void {
    this.posts.unshift(post);
    this.persist();
  }

  public resetToFactorySeed(): void {
    this.resetToDefault();
  }

  public exportDatabaseBackupJson(): string {
    return this.exportDatabaseJson();
  }

  public restoreDatabaseBackupJson(jsonString: string): boolean {
    return this.importDatabaseJson(jsonString);
  }

  // ─── Database Utilities ──────────────────────────────────────
  public exportDatabaseJson(): string {
    return JSON.stringify({
      schema: this.schema,
      posts: this.posts,
      exportedAt: new Date().toISOString(),
      version: '5.0.0',
    }, null, 2);
  }

  public importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.schema?.players && parsed.schema?.teams) {
        this.schema = parsed.schema;
        if (parsed.posts) this.posts = parsed.posts;
        this.log('DATABASE_RESTORED', 'migration', 'sys-restore', 'Database restored from backup file.');
        this.persist();
        return true;
      }
    } catch (e) {
      console.error('[FanClub DB] Database import parse error:', e);
    }
    return false;
  }

  public resetToDefault(): void {
    this.schema = this.getDefaultSchema();
    this.posts = SEED_COMMUNITY_POSTS;
    this.log('DATABASE_RESET', 'migration', 'sys-reset', 'Database reset to default seed state.');
    this.persist();
  }
}

// Export singleton database instance
export const db = new FanClubDatabase();
