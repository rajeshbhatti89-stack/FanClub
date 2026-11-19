// ============================================================
// FAN CLUB — Worldwide Player Discovery & Auto-Import Engine
// Automatically crawls tournaments, franchise leagues & squads
// to discover missing players and populate the global registry.
// ============================================================
import type { Player, Team, Tournament } from '../types/cricket';
import { db } from '../db/database';

export interface DiscoveryScanResult {
  scanTimestamp: string;
  tournamentsScanned: number;
  teamsScanned: number;
  newPlayersDiscovered: number;
  playersRegistered: Player[];
}

export class PlayerDiscoveryEngine {
  public scanAndDiscoverFromTournaments(tournaments: Tournament[]): DiscoveryScanResult {
    const existingPlayers = db.getPlayers();
    const existingIds = new Set(existingPlayers.map(p => p.id));
    const existingNames = new Set(existingPlayers.map(p => p.name.trim().toLowerCase()));

    const newPlayers: Player[] = [];
    let teamsCount = 0;

    tournaments.forEach(tour => {
      tour.teams.forEach(team => {
        teamsCount++;
        team.players.forEach(p => {
          const nameKey = p.name.trim().toLowerCase();
          if (!existingIds.has(p.id) && !existingNames.has(nameKey)) {
            existingIds.add(p.id);
            existingNames.add(nameKey);
            newPlayers.push({
              ...p,
              dataProvenance: {
                source: 'system',
                importedAt: new Date().toISOString(),
                licenseAttribution: `Discovered from tournament ${tour.name} • Team ${team.name}`,
              },
            });
          }
        });
      });
    });

    if (newPlayers.length > 0) {
      db.upsertPlayersBatch(newPlayers);
      db.log(
        'PLAYER_DISCOVERY_COMPLETED',
        'migration',
        `scan-${Date.now()}`,
        `Discovered and registered ${newPlayers.length} new players across ${tournaments.length} tournaments.`
      );
    }

    return {
      scanTimestamp: new Date().toISOString(),
      tournamentsScanned: tournaments.length,
      teamsScanned: teamsCount,
      newPlayersDiscovered: newPlayers.length,
      playersRegistered: newPlayers,
    };
  }
}

export const playerDiscoveryEngine = new PlayerDiscoveryEngine();
