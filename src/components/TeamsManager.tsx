import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Plus,
  ChevronLeft,
  Upload,
  X,
  Shield,
  BarChart2,
  User,
  Search,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import type { Team, Player, PlayerRole, BattingStyle, BowlingStyle } from '../types/cricket';

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fanclub_teams_v2';

const ROLES: { value: PlayerRole; label: string }[] = [
  { value: 'batsman', label: 'Batsman' },
  { value: 'bowler', label: 'Bowler' },
  { value: 'allrounder', label: 'All-rounder' },
  { value: 'wicketkeeper', label: 'Wicket-keeper' },
];

const BATTING_STYLES: { value: BattingStyle; label: string }[] = [
  { value: 'RHB', label: 'Right-Hand Bat (RHB)' },
  { value: 'LHB', label: 'Left-Hand Bat (LHB)' },
];

const BOWLING_STYLES: { value: BowlingStyle; label: string }[] = [
  { value: 'Right-arm Fast', label: 'Right-arm Fast' },
  { value: 'Right-arm Fast-Medium', label: 'Right-arm Fast-Medium' },
  { value: 'Right-arm Medium', label: 'Right-arm Medium' },
  { value: 'Right-arm Off-Spin', label: 'Right-arm Off-Spin' },
  { value: 'Right-arm Leg-Spin', label: 'Right-arm Leg-Spin' },
  { value: 'Left-arm Fast', label: 'Left-arm Fast' },
  { value: 'Left-arm Fast-Medium', label: 'Left-arm Fast-Medium' },
  { value: 'Left-arm Orthodox Spin', label: 'Left-arm Orthodox Spin' },
  { value: 'Left-arm Wrist Spin', label: 'Left-arm Wrist Spin' },
];

const ROLE_BADGE: Record<PlayerRole, string> = {
  batsman: 'bg-blue-100 text-blue-700 border border-blue-200',
  bowler: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  allrounder: 'bg-purple-100 text-purple-700 border border-purple-200',
  wicketkeeper: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const ROLE_LABEL: Record<PlayerRole, string> = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  allrounder: 'All-rounder',
  wicketkeeper: 'Wicket-keeper',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toShortName(name: string): string {
  return name
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function battingAvg(p: Player): string {
  const dism = p.innings - p.notOuts;
  if (dism === 0) return p.runs > 0 ? '∞' : '-';
  return (p.runs / dism).toFixed(2);
}

function emptyPlayer(): Omit<Player, 'id'> {
  return {
    name: '',
    role: 'batsman',
    battingStyle: 'RHB',
    bowlingStyle: undefined,
    jerseyNumber: undefined,
    avatar: undefined,
    matches: 0,
    innings: 0,
    runs: 0,
    highestScore: 0,
    notOuts: 0,
    fifties: 0,
    hundreds: 0,
    strikeRate: 0,
    battingAverage: 0,
    wickets: 0,
    bowlingEconomy: 0,
    bowlingAverage: 0,
    bestBowling: '-',
    catches: 0,
    runOuts: 0,
    stumpings: 0,
  };
}

function emptyTeam(): Omit<Team, 'id'> {
  return {
    name: '',
    shortName: '',
    color: '#1d4ed8',
    secondaryColor: '#7c3aed',
    logo: undefined,
    players: [],
  };
}

function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Team[]) : [];
  } catch {
    return [];
  }
}

function saveTeams(teams: Team[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Create Team Modal ────────────────────────────────────────────────────────

interface CreateTeamModalProps {
  onClose: () => void;
  onSave: (team: Team) => void;
}

function CreateTeamModal({ onClose, onSave }: CreateTeamModalProps) {
  const [form, setForm] = useState(emptyTeam());
  const [shortNameTouched, setShortNameTouched] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((prev) => {
      const updated = { ...prev, [k]: v };
      if (k === 'name' && !shortNameTouched) {
        updated.shortName = toShortName(v as string);
      }
      return updated;
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setLogoPreview(b64);
    setField('logo', b64);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Team name is required.';
    if (!form.shortName.trim() || form.shortName.length < 2)
      errs.shortName = 'Short name must be 2–3 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const team: Team = { ...form, id: uid() };
    onSave(team);
  };

  return (
    <Modal title="Create New Team" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g. Royal Challengers"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Short Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Name (2–3 letters) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.shortName}
            maxLength={3}
            onChange={(e) => {
              setShortNameTouched(true);
              setField('shortName', e.target.value.toUpperCase());
            }}
            placeholder="e.g. RCB"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
          {errors.shortName && <p className="text-red-500 text-xs mt-1">{errors.shortName}</p>}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setField('color', e.target.value)}
                className="h-9 w-16 rounded cursor-pointer border border-gray-300 p-0.5"
              />
              <span className="text-xs text-gray-500 font-mono">{form.color}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => setField('secondaryColor', e.target.value)}
                className="h-9 w-16 rounded cursor-pointer border border-gray-300 p-0.5"
              />
              <span className="text-xs text-gray-500 font-mono">{form.secondaryColor}</span>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Logo (optional)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => logoRef.current?.click()}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="logo preview" className="h-20 w-20 object-contain rounded-lg" />
            ) : (
              <>
                <Upload size={28} className="text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Click to upload team logo</p>
              </>
            )}
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        {/* Preview */}
        {form.name && (
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{ backgroundColor: form.color + '18', borderLeft: `4px solid ${form.color}` }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="" className="h-10 w-10 object-contain rounded-full border border-white shadow" />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                style={{ backgroundColor: form.color }}
              >
                {form.shortName || '?'}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">{form.name}</p>
              <p className="text-xs text-gray-500">{form.shortName}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Team
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Player Modal ─────────────────────────────────────────────────────────

interface AddPlayerModalProps {
  teamColor: string;
  onClose: () => void;
  onSave: (player: Player) => void;
  existing?: Player;
}

function AddPlayerModal({ teamColor, onClose, onSave, existing }: AddPlayerModalProps) {
  const [form, setForm] = useState<Omit<Player, 'id'>>(existing ? { ...existing } : emptyPlayer());
  const [photoPreview, setPhotoPreview] = useState<string | null>(existing?.avatar ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setPhotoPreview(b64);
    setField('avatar', b64);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Player name is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const player: Player = { ...form, id: existing?.id ?? uid() };
    onSave(player);
  };

  return (
    <Modal title={existing ? 'Edit Player' : 'Add Player'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo + Name row */}
        <div className="flex items-start gap-4">
          <div
            className="relative flex-shrink-0 h-16 w-16 rounded-full border-2 border-white shadow cursor-pointer overflow-hidden flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: teamColor }}
            onClick={() => photoRef.current?.click()}
            title="Upload photo"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{form.name ? initials(form.name) : <User size={22} />}</span>
            )}
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow">
              <Upload size={10} className="text-gray-600" />
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Virat Kohli"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Jersey Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number (optional)</label>
          <input
            type="number"
            value={form.jerseyNumber ?? ''}
            min={0}
            max={999}
            onChange={(e) =>
              setField('jerseyNumber', e.target.value === '' ? undefined : Number(e.target.value))
            }
            placeholder="e.g. 18"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                  form.role === r.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={() => setField('role', r.value)}
                  className="accent-blue-600"
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Batting Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batting Style</label>
          <select
            value={form.battingStyle ?? ''}
            onChange={(e) => setField('battingStyle', e.target.value as BattingStyle)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select —</option>
            {BATTING_STYLES.map((bs) => (
              <option key={bs.value} value={bs.value}>
                {bs.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bowling Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bowling Style</label>
          <select
            value={form.bowlingStyle ?? ''}
            onChange={(e) =>
              setField('bowlingStyle', e.target.value === '' ? undefined : (e.target.value as BowlingStyle))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— None / N/A —</option>
            {BOWLING_STYLES.map((bs) => (
              <option key={bs.value} value={bs.value}>
                {bs.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {existing ? 'Save Changes' : 'Add Player'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Player Detail Modal ──────────────────────────────────────────────────────

interface PlayerDetailModalProps {
  player: Player;
  teamColor: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PlayerDetailModal({ player, teamColor, onClose, onEdit, onDelete }: PlayerDetailModalProps) {
  const avg = battingAvg(player);

  const statRow = (label: string, value: string | number) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );

  return (
    <Modal title="Player Profile" onClose={onClose}>
      {/* Header */}
      <div
        className="rounded-xl p-4 flex items-center gap-4 mb-4"
        style={{ background: `linear-gradient(135deg, ${teamColor}22, ${teamColor}08)`, border: `1px solid ${teamColor}33` }}
      >
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        >
          {player.avatar ? (
            <img src={player.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(player.name)
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{player.name}</h3>
              {player.jerseyNumber != null && (
                <p className="text-xs text-gray-400">#{player.jerseyNumber}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[player.role]}`}>
              {ROLE_LABEL[player.role]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {player.battingStyle && (
              <span className="text-xs bg-white/80 border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                🏏 {player.battingStyle}
              </span>
            )}
            {player.bowlingStyle && (
              <span className="text-xs bg-white/80 border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                ⚾ {player.bowlingStyle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'M', value: player.matches },
          { label: 'Runs', value: player.runs },
          { label: 'Wkts', value: player.wickets },
          { label: 'Avg', value: avg },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Full stats */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Career Stats</p>
        {statRow('Innings', player.innings)}
        {statRow('Highest Score', player.highestScore)}
        {statRow('Not Outs', player.notOuts)}
        {statRow('Strike Rate', player.strikeRate > 0 ? player.strikeRate.toFixed(2) : '-')}
        {statRow('50s / 100s', `${player.fifties} / ${player.hundreds}`)}
        {statRow('Wickets', player.wickets)}
        {statRow('Best Bowling', player.bestBowling)}
        {statRow('Economy', player.bowlingEconomy > 0 ? player.bowlingEconomy.toFixed(2) : '-')}
        {statRow('Catches', player.catches)}
        {statRow('Run Outs', player.runOuts)}
        {player.role === 'wicketkeeper' && statRow('Stumpings', player.stumpings)}
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} /> Remove
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 size={14} /> Edit Player
        </button>
      </div>
    </Modal>
  );
}

// ─── Team Detail View ─────────────────────────────────────────────────────────

type TeamTab = 'squad' | 'stats';

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onTeamUpdate: (team: Team) => void;
}

function TeamDetail({ team, onBack, onTeamUpdate }: TeamDetailProps) {
  const [activeTab, setActiveTab] = useState<TeamTab>('squad');
  const [search, setSearch] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

  const filtered = team.players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePlayer = useCallback(
    (player: Player) => {
      const exists = team.players.some((p) => p.id === player.id);
      const updatedPlayers = exists
        ? team.players.map((p) => (p.id === player.id ? player : p))
        : [...team.players, player];
      onTeamUpdate({ ...team, players: updatedPlayers });
      setShowAddPlayer(false);
      setEditingPlayer(null);
    },
    [team, onTeamUpdate]
  );

  const handleDeletePlayer = useCallback(
    (playerId: string) => {
      onTeamUpdate({ ...team, players: team.players.filter((p) => p.id !== playerId) });
      setViewingPlayer(null);
    },
    [team, onTeamUpdate]
  );

  const roleBadge = (role: PlayerRole) => (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="rounded-2xl p-5 mb-4 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${team.color}, ${team.secondaryColor})`,
        }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow overflow-hidden flex-shrink-0"
        >
          {team.logo ? (
            <img src={team.logo} alt="" className="h-full w-full object-contain" />
          ) : (
            team.shortName
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-white leading-tight">{team.name}</h2>
          <p className="text-white/70 text-sm">{team.players.length} players</p>
        </div>

        <button
          onClick={() => setShowAddPlayer(true)}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} /> Add Player
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 w-fit">
        {([
          { id: 'squad' as TeamTab, label: 'Squad', icon: <Users size={14} /> },
          { id: 'stats' as TeamTab, label: 'Career Stats', icon: <BarChart2 size={14} /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
          <Shield size={40} className="mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No players yet</p>
          <p className="text-sm">Add players to build your squad</p>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="mt-4 flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add First Player
          </button>
        </div>
      ) : activeTab === 'squad' ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Player</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Style</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">M</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Runs</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Wkts</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => setViewingPlayer(p)}
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden shadow-sm"
                        style={{ backgroundColor: team.color }}
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials(p.name)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.jerseyNumber != null && (
                          <p className="text-xs text-gray-400">#{p.jerseyNumber}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{roleBadge(p.role)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {p.battingStyle && <span>{p.battingStyle}</span>}
                    {p.bowlingStyle && <span className="block">{p.bowlingStyle}</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{p.matches}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{p.runs}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium hidden sm:table-cell">{p.wickets}</td>
                  <td className="px-2 py-3 text-center">
                    <Eye size={14} className="text-gray-300 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Career Stats tab */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Player', 'M', 'Inns', 'Runs', 'HS', 'Avg', 'SR', '50s', '100s', 'Wkts', 'Econ', 'BB', 'Catches'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap text-right first:text-left"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => setViewingPlayer(p)}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: team.color }}
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials(p.name)
                        )}
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.matches}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.innings}</td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-900">{p.runs}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.highestScore}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{battingAvg(p)}</td>
                  <td className="px-3 py-3 text-right text-gray-700">
                    {p.strikeRate > 0 ? p.strikeRate.toFixed(1) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.fifties}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.hundreds}</td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-900">{p.wickets}</td>
                  <td className="px-3 py-3 text-right text-gray-700">
                    {p.bowlingEconomy > 0 ? p.bowlingEconomy.toFixed(2) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.bestBowling}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{p.catches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddPlayer && (
        <AddPlayerModal
          teamColor={team.color}
          onClose={() => setShowAddPlayer(false)}
          onSave={handleSavePlayer}
        />
      )}

      {editingPlayer && (
        <AddPlayerModal
          teamColor={team.color}
          existing={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={(p) => {
            handleSavePlayer(p);
            setViewingPlayer(null);
          }}
        />
      )}

      {viewingPlayer && !editingPlayer && (
        <PlayerDetailModal
          player={viewingPlayer}
          teamColor={team.color}
          onClose={() => setViewingPlayer(null)}
          onEdit={() => {
            setEditingPlayer(viewingPlayer);
            setViewingPlayer(null);
          }}
          onDelete={() => handleDeletePlayer(viewingPlayer.id)}
        />
      )}
    </div>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────

interface TeamCardProps {
  team: Team;
  onClick: () => void;
  onDelete: () => void;
}

function TeamCard({ team, onClick, onDelete }: TeamCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group"
      style={{ borderLeft: `4px solid ${team.color}` }}
      onClick={onClick}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Logo / Badge */}
        <div
          className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${team.color}, ${team.secondaryColor})`,
          }}
        >
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
          ) : (
            team.shortName
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{team.name}</h3>
          <p className="text-sm text-gray-400">{team.shortName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Users size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{team.players.length} players</span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
          title="Delete team"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Color strip */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, ${team.color}, ${team.secondaryColor})`,
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface TeamsManagerProps {
  onTeamsChange?: (teams: Team[]) => void;
}

export default function TeamsManager({ onTeamsChange }: TeamsManagerProps) {
  const [teams, setTeams] = useState<Team[]>(loadTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Persist and notify parent whenever teams change
  useEffect(() => {
    saveTeams(teams);
    onTeamsChange?.(teams);
  }, [teams, onTeamsChange]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  const handleCreateTeam = useCallback((team: Team) => {
    setTeams((prev) => [...prev, team]);
    setShowCreateTeam(false);
    setSelectedTeamId(team.id);
  }, []);

  const handleTeamUpdate = useCallback((updated: Team) => {
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleDeleteTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    if (selectedTeamId === id) setSelectedTeamId(null);
    setDeleteConfirmId(null);
  }, [selectedTeamId]);

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Team Detail View ──
  if (selectedTeam) {
    return (
      <div className="p-4 md:p-6">
        <TeamDetail
          team={selectedTeam}
          onBack={() => setSelectedTeamId(null)}
          onTeamUpdate={handleTeamUpdate}
        />
      </div>
    );
  }

  // ── Teams List ──
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" />
            Teams
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{teams.length} team{teams.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowCreateTeam(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Team
        </button>
      </div>

      {/* Search */}
      {teams.length > 0 && (
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Shield size={36} className="text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Teams Yet</h2>
          <p className="text-gray-400 text-sm max-w-sm mb-6">
            Create your first team to start managing players, tracking stats, and scoring matches.
          </p>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Create First Team
          </button>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No teams match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => setSelectedTeamId(team.id)}
              onDelete={() => setDeleteConfirmId(team.id)}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateTeamModal onClose={() => setShowCreateTeam(false)} onSave={handleCreateTeam} />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteConfirmId(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Team?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove{' '}
              <span className="font-semibold text-gray-800">
                {teams.find((t) => t.id === deleteConfirmId)?.name}
              </span>{' '}
              and all its players. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTeam(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
