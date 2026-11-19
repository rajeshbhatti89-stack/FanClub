// ============================================================
// FAN CLUB — Authentication & Role-Based Access Control Types
// ============================================================
import type { UserRole } from './database';

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    clubId?: string;
  } | null;
}

export type Permission =
  | 'score_match'
  | 'edit_scorecard'
  | 'manage_club'
  | 'create_tournament'
  | 'manage_tournament'
  | 'create_player'
  | 'import_cricheroes'
  | 'manage_users'
  | 'stream_obs'
  | 'manage_providers'
  | 'export_data'
  | 'post_community'
  | 'moderate_community';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'score_match', 'edit_scorecard', 'manage_club', 'create_tournament',
    'manage_tournament', 'create_player', 'import_cricheroes', 'manage_users',
    'stream_obs', 'manage_providers', 'export_data', 'post_community', 'moderate_community'
  ],
  admin: [
    'score_match', 'edit_scorecard', 'manage_club', 'create_tournament',
    'manage_tournament', 'create_player', 'import_cricheroes', 'manage_users',
    'stream_obs', 'export_data', 'post_community', 'moderate_community'
  ],
  club_manager: [
    'manage_club', 'create_tournament', 'manage_tournament', 'score_match',
    'create_player', 'post_community', 'export_data'
  ],
  team_manager: [
    'score_match', 'create_player', 'post_community', 'export_data'
  ],
  match_scorer: [
    'score_match', 'edit_scorecard', 'post_community'
  ],
  streamer: [
    'stream_obs', 'post_community'
  ],
  player: [
    'post_community'
  ],
  fan: [
    'post_community'
  ]
};
