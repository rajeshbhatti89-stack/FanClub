import { useState, useEffect, useCallback } from 'react';
import type {
  Tournament,
  TournamentTeamStats,
  TournamentFixture,
  PlanType,
} from '../types/cricket';
import type { Team } from '../types/cricket';
import {
  Trophy,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Star,
  Shield,
  Zap,
  X,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  BarChart2,
  List,
  Grid,
  Clock,
  Award,
  TrendingUp,
  Crosshair,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Local-only extended type for leaderboard data
// ─────────────────────────────────────────────
interface LocalLeaderboardEntry {
  rank: number;
  playerName: string;
  teamName: string;
  teamColor: string;
  value: number;
  extra?: string;
}

interface TournamentLeaderboards {
  orangeCap: LocalLeaderboardEntry[];
  purpleCap: LocalLeaderboardEntry[];
  mostSixes: LocalLeaderboardEntry[];
  bestEconomy: LocalLeaderboardEntry[];
}

interface StoredTournament extends Tournament {
  leaderboards: TournamentLeaderboards;
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface TournamentManagerProps {
  currentPlan: PlanType;
  onOpenPlans: () => void;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const LS_KEY = 'fanclub_tournaments_v3';
const OVERS_OPTIONS = [5, 8, 10, 12, 15, 20, 50];
const BALL_TYPE_OPTIONS = [
  { value: 'leather_white', label: 'Leather (White)' },
  { value: 'leather_red', label: 'Leather (Red)' },
  { value: 'leather_pink', label: 'Leather (Pink)' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'rubber', label: 'Rubber' },
];
const FORMAT_OPTIONS = [
  { value: 'league', label: 'League' },
  { value: 'knockout', label: 'Knockout' },
  { value: 'league_knockout', label: 'League + Knockout' },
  { value: 'round_robin', label: 'Round Robin' },
];
const TEAM_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6366F1', '#06B6D4', '#10B981', '#F59E0B',
];
const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
};
const FORM_COLORS: Record<string, string> = {
  W: 'bg-green-500',
  L: 'bg-red-500',
  T: 'bg-yellow-500',
  NR: 'bg-gray-400',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTournaments(): StoredTournament[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTournaments(list: StoredTournament[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function formatDate(d: string) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calcNRR(stats: TournamentTeamStats): number {
  const runsPerOverScored = stats.oversFaced > 0 ? stats.runsScored / stats.oversFaced : 0;
  const runsPerOverConceded = stats.oversBowled > 0 ? stats.runsConceded / stats.oversBowled : 0;
  return parseFloat((runsPerOverScored - runsPerOverConceded).toFixed(3));
}

function emptyStats(teamId: string, teamName: string, teamColor: string): TournamentTeamStats {
  return {
    teamId, teamName, teamColor,
    played: 0, won: 0, lost: 0, tied: 0, nr: 0,
    points: 0, nrr: 0,
    runsScored: 0, oversFaced: 0,
    runsConceded: 0, oversBowled: 0,
    form: [],
  };
}

function emptyLeaderboards(): TournamentLeaderboards {
  return { orangeCap: [], purpleCap: [], mostSixes: [], bestEconomy: [] };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface StatusBadgeProps { status: string }
function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

interface TeamColorDotProps { color: string; size?: number }
function TeamColorDot({ color, size = 10 }: TeamColorDotProps) {
  return <span className="inline-block rounded-full border border-white/40" style={{ width: size, height: size, background: color }} />;
}

// ─────────────────────────────────────────────
// Modal overlay
// ─────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }
function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6">
      <div className={`bg-white rounded-3xl shadow-2xl w-full mx-4 my-auto ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Form input helpers
// ─────────────────────────────────────────────
interface FieldProps { label: string; required?: boolean; children: React.ReactNode }
function Field({ label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50';
const selectCls = `${inputCls} cursor-pointer`;

// ─────────────────────────────────────────────
// Create Tournament Modal
// ─────────────────────────────────────────────
interface CreateTournamentModalProps {
  onClose: () => void;
  onSave: (t: StoredTournament) => void;
}

interface TeamDraft {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

function CreateTournamentModal({ onClose, onSave }: CreateTournamentModalProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [overs, setOvers] = useState(20);
  const [ballType, setBallType] = useState('leather_white');
  const [format, setFormat] = useState<Tournament['format']>('league');
  const [prizePool, setPrizePool] = useState('');
  const [description, setDescription] = useState('');
  const [teams, setTeams] = useState<TeamDraft[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamShort, setTeamShort] = useState('');
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [error, setError] = useState('');

  const addTeam = () => {
    if (!teamName.trim()) return;
    setTeams(prev => [...prev, {
      id: uid(),
      name: teamName.trim(),
      shortName: teamShort.trim().toUpperCase().slice(0, 3) || teamName.slice(0, 3).toUpperCase(),
      color: teamColor,
    }]);
    setTeamName('');
    setTeamShort('');
    setTeamColor(TEAM_COLORS[teams.length % TEAM_COLORS.length]);
  };

  const removeTeam = (id: string) => setTeams(prev => prev.filter(t => t.id !== id));

  const handleSave = () => {
    if (!name.trim()) { setError('Tournament name is required.'); return; }
    if (!startDate) { setError('Start date is required.'); return; }

    const builtTeams: Team[] = teams.map(td => ({
      id: td.id,
      name: td.name,
      shortName: td.shortName,
      color: td.color,
      secondaryColor: td.color,
      players: [],
    }));

    const standings: TournamentTeamStats[] = builtTeams.map(t =>
      emptyStats(t.id, t.name, t.color)
    );

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    let status: Tournament['status'] = 'upcoming';
    if (now >= start && (!end || now <= end)) status = 'ongoing';
    if (end && now > end) status = 'completed';

    const newT: StoredTournament = {
      id: uid(),
      name: name.trim(),
      shortName: shortName.trim().toUpperCase().slice(0, 4),
      organizer: organizer.trim(),
      city: city.trim(),
      startDate,
      endDate: endDate || '',
      overs,
      ballType,
      format,
      prizePool: prizePool.trim(),
      description: description.trim(),
      teams: builtTeams,
      fixtures: [],
      standings,
      status,
      leaderboards: emptyLeaderboards(),
    };
    onSave(newT);
  };

  return (
    <Modal title="Create Tournament" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Tournament Name" required>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premier Cricket League 2026" />
            </Field>
          </div>
          <Field label="Short Name / Tag">
            <input className={inputCls} maxLength={4} value={shortName} onChange={e => setShortName(e.target.value)} placeholder="e.g. PCL" />
          </Field>
          <Field label="Organizer / Club">
            <input className={inputCls} value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="Club or Org name" />
          </Field>
          <div className="col-span-2">
            <Field label="City / Venue Ground">
              <input className={inputCls} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai, Wankhede Stadium" />
            </Field>
          </div>
          <Field label="Start Date" required>
            <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </Field>
          <Field label="Overs per Match">
            <select className={selectCls} value={overs} onChange={e => setOvers(Number(e.target.value))}>
              {OVERS_OPTIONS.map(o => <option key={o} value={o}>{o} overs</option>)}
            </select>
          </Field>
          <Field label="Ball Type">
            <select className={selectCls} value={ballType} onChange={e => setBallType(e.target.value)}>
              {BALL_TYPE_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Format">
              <select className={selectCls} value={format} onChange={e => setFormat(e.target.value as Tournament['format'])}>
                {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Prize Pool (optional)">
              <input className={inputCls} value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="e.g. ₹50,000 cash prize" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Description (optional)">
              <textarea className={`${inputCls} resize-none`} rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description about this tournament…" />
            </Field>
          </div>
        </div>

        {/* Teams Section */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Teams</p>
          {teams.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {teams.map(t => (
                <div key={t.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                  <TeamColorDot color={t.color} size={10} />
                  <span className="text-xs font-semibold text-gray-700">{t.name}</span>
                  <span className="text-xs text-gray-400">({t.shortName})</span>
                  <button onClick={() => removeTeam(t.id)} className="ml-1 text-gray-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input
                className={inputCls}
                placeholder="Team name"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTeam()}
              />
            </div>
            <div className="w-20">
              <input
                className={inputCls}
                maxLength={3}
                placeholder="Short"
                value={teamShort}
                onChange={e => setTeamShort(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              {TEAM_COLORS.slice(0, 6).map(c => (
                <button
                  key={c}
                  onClick={() => setTeamColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: teamColor === c ? '#1f2937' : 'transparent' }}
                />
              ))}
            </div>
            <button
              onClick={addTeam}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md">
            Create Tournament
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Add Fixture Modal
// ─────────────────────────────────────────────
interface AddFixtureModalProps {
  teams: Team[];
  onClose: () => void;
  onAdd: (f: TournamentFixture) => void;
}

function AddFixtureModal({ teams, onClose, onAdd }: AddFixtureModalProps) {
  const [teamAId, setTeamAId] = useState(teams[0]?.id ?? '');
  const [teamBId, setTeamBId] = useState(teams[1]?.id ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [round, setRound] = useState('');
  const [err, setErr] = useState('');

  const handleAdd = () => {
    if (teamAId === teamBId) { setErr('Teams must be different.'); return; }
    if (!date) { setErr('Date is required.'); return; }
    const tA = teams.find(t => t.id === teamAId)!;
    const tB = teams.find(t => t.id === teamBId)!;
    const fixture: TournamentFixture = {
      id: uid(),
      teamAId,
      teamAName: tA.name,
      teamBId,
      teamBName: tB.name,
      venue: venue.trim(),
      date,
      time: time || '00:00',
      round: round.trim() || 'Group Stage',
      status: 'scheduled',
    };
    onAdd(fixture);
  };

  return (
    <Modal title="Add Fixture" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {err && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 flex gap-2 items-center">
            <AlertCircle size={14} />{err}
          </div>
        )}
        <Field label="Team A" required>
          <select className={selectCls} value={teamAId} onChange={e => setTeamAId(e.target.value)}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Team B" required>
          <select className={selectCls} value={teamBId} onChange={e => setTeamBId(e.target.value)}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required>
            <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          <Field label="Time">
            <input type="time" className={inputCls} value={time} onChange={e => setTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Venue">
          <input className={inputCls} value={venue} onChange={e => setVenue(e.target.value)} placeholder="Ground name" />
        </Field>
        <Field label="Round Name">
          <input className={inputCls} value={round} onChange={e => setRound(e.target.value)} placeholder="e.g. Group Stage, Quarter Final" />
        </Field>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">Add Fixture</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Add Leaderboard Entry Modal
// ─────────────────────────────────────────────
interface AddLeaderboardEntryModalProps {
  type: 'orangeCap' | 'purpleCap' | 'mostSixes' | 'bestEconomy';
  teams: Team[];
  onClose: () => void;
  onAdd: (entry: LocalLeaderboardEntry) => void;
}

const LB_LABELS = {
  orangeCap: { label: 'Add Top Run-Scorer', valuePlaceholder: 'Runs scored', extraPlaceholder: 'e.g. 68 off 42 balls' },
  purpleCap: { label: 'Add Top Wicket-Taker', valuePlaceholder: 'Wickets taken', extraPlaceholder: 'e.g. 4/22 in 4 overs' },
  mostSixes: { label: 'Add Top Six-Hitter', valuePlaceholder: 'Sixes hit', extraPlaceholder: 'e.g. 8 matches' },
  bestEconomy: { label: 'Add Best Economy', valuePlaceholder: 'Economy rate', extraPlaceholder: 'e.g. 24 overs' },
};

function AddLeaderboardEntryModal({ type, teams, onClose, onAdd }: AddLeaderboardEntryModalProps) {
  const meta = LB_LABELS[type];
  const [playerName, setPlayerName] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [extra, setExtra] = useState('');
  const [rank, setRank] = useState(1);

  const handleAdd = () => {
    if (!playerName.trim() || !value) return;
    const team = teams.find(t => t.id === teamId);
    onAdd({
      rank,
      playerName: playerName.trim(),
      teamName: team?.name ?? '',
      teamColor: team?.color ?? '#6b7280',
      value: parseFloat(value),
      extra: extra.trim(),
    });
  };

  return (
    <Modal title={meta.label} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Player Name" required>
          <input className={inputCls} value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Player name" />
        </Field>
        <Field label="Team" required>
          <select className={selectCls} value={teamId} onChange={e => setTeamId(e.target.value)}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={meta.valuePlaceholder} required>
            <input type="number" className={inputCls} value={value} onChange={e => setValue(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Rank">
            <input type="number" min={1} className={inputCls} value={rank} onChange={e => setRank(Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Extra Info">
          <input className={inputCls} value={extra} onChange={e => setExtra(e.target.value)} placeholder={meta.extraPlaceholder} />
        </Field>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold">Add Entry</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Tab: Overview
// ─────────────────────────────────────────────
interface OverviewTabProps { tournament: StoredTournament }
function OverviewTab({ tournament: t }: OverviewTabProps) {
  const formatLabel = FORMAT_OPTIONS.find(f => f.value === t.format)?.label ?? t.format;
  const ballLabel = BALL_TYPE_OPTIONS.find(b => b.value === t.ballType)?.label ?? t.ballType;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 px-6 py-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={20} className="text-orange-200" />
            {t.shortName && <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">{t.shortName}</span>}
            <StatusBadge status={t.status} />
          </div>
          <h1 className="text-2xl font-black leading-tight">{t.name}</h1>
          {t.organizer && <p className="text-orange-200 text-sm mt-0.5">by {t.organizer}</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {t.city && (
              <span className="flex items-center gap-1 text-orange-100"><MapPin size={14} />{t.city}</span>
            )}
            <span className="flex items-center gap-1 text-orange-100">
              <Calendar size={14} />{formatDate(t.startDate)}{t.endDate ? ` – ${formatDate(t.endDate)}` : ''}
            </span>
            <span className="flex items-center gap-1 text-orange-100"><Zap size={14} />{t.overs} overs · {formatLabel}</span>
            <span className="flex items-center gap-1 text-orange-100"><Shield size={14} />{ballLabel}</span>
          </div>
          {t.prizePool && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-300/30 rounded-xl px-3 py-1">
              <Star size={13} className="text-yellow-300" />
              <span className="text-xs font-semibold text-yellow-100">{t.prizePool}</span>
            </div>
          )}
        </div>
      </div>

      {t.description && (
        <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>
      )}

      {/* Teams grid */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Participating Teams ({t.teams.length})</p>
        {t.teams.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No teams added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {t.teams.map(team => (
              <div
                key={team.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: team.color, borderLeftWidth: 4 }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0" style={{ background: team.color }}>
                  {team.shortName}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.players.length} players</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Points Table
// ─────────────────────────────────────────────
interface PointsTableTabProps {
  tournament: StoredTournament;
  onUpdateStandings: (standings: TournamentTeamStats[]) => void;
}

function PointsTableTab({ tournament, onUpdateStandings }: PointsTableTabProps) {
  const sorted = [...tournament.standings].sort((a, b) => b.points - a.points || calcNRR(b) - calcNRR(a));

  const addTeamToStandings = () => {
    const unlistedTeams = tournament.teams.filter(t =>
      !tournament.standings.find(s => s.teamId === t.id)
    );
    if (unlistedTeams.length === 0) return;
    const t = unlistedTeams[0];
    onUpdateStandings([...tournament.standings, emptyStats(t.id, t.name, t.color)]);
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <BarChart2 size={40} className="text-gray-200" />
        <p className="text-sm text-gray-400">No standings yet. Add teams to the tournament first.</p>
        {tournament.teams.length > tournament.standings.length && (
          <button onClick={addTeamToStandings} className="flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
            <Plus size={16} /> Add Team to Table
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wide">
              <th className="text-left px-3 py-3 w-6">#</th>
              <th className="text-left px-3 py-3">Team</th>
              <th className="px-2 py-3 text-center w-8">P</th>
              <th className="px-2 py-3 text-center w-8">W</th>
              <th className="px-2 py-3 text-center w-8">L</th>
              <th className="px-2 py-3 text-center w-8">T</th>
              <th className="px-2 py-3 text-center w-8">NR</th>
              <th className="px-2 py-3 text-center w-10 font-bold text-orange-600">Pts</th>
              <th className="px-2 py-3 text-center w-16">NRR</th>
              <th className="px-3 py-3 text-center">Last 5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((row, idx) => {
              const nrr = calcNRR(row);
              const isQualified = idx < 2 && row.played > 0;
              return (
                <tr
                  key={row.teamId}
                  className={`hover:bg-orange-50/40 transition-colors ${isQualified ? 'bg-green-50/30' : ''}`}
                >
                  <td className="px-3 py-2.5 font-bold text-gray-500">
                    <div className="flex items-center gap-1">
                      {isQualified && <span className="text-xs bg-green-500 text-white rounded-full px-1 font-bold">Q</span>}
                      {!isQualified && idx + 1}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-xs" style={{ background: row.teamColor }}>
                        {row.teamName.slice(0, 1)}
                      </div>
                      <span className="font-semibold text-gray-800">{row.teamName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-600">{row.played}</td>
                  <td className="px-2 py-2.5 text-center text-green-600 font-semibold">{row.won}</td>
                  <td className="px-2 py-2.5 text-center text-red-500 font-semibold">{row.lost}</td>
                  <td className="px-2 py-2.5 text-center text-yellow-600">{row.tied}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{row.nr}</td>
                  <td className="px-2 py-2.5 text-center font-black text-orange-600 text-sm">{row.points}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-gray-600">{nrr >= 0 ? '+' : ''}{nrr.toFixed(3)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-0.5 justify-center">
                      {row.form.slice(-5).map((r, i) => (
                        <span key={i} className={`w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold ${FORM_COLORS[r] ?? 'bg-gray-300'}`}>
                          {r}
                        </span>
                      ))}
                      {row.form.length === 0 && <span className="text-gray-300 text-xs">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* NRR formula note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700">
        <strong>NRR Formula:</strong> (Runs Scored ÷ Overs Faced) − (Runs Conceded ÷ Overs Bowled). Qualified (Q) spots are top-2 teams with matches played.
      </div>

      {tournament.teams.length > tournament.standings.length && (
        <button
          onClick={addTeamToStandings}
          className="self-start flex items-center gap-2 border border-dashed border-orange-300 text-orange-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
        >
          <Plus size={15} /> Add Team to Table
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Fixtures
// ─────────────────────────────────────────────
interface FixturesTabProps {
  tournament: StoredTournament;
  onUpdateFixtures: (fixtures: TournamentFixture[]) => void;
}

const FIXTURE_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  abandoned: 'bg-red-100 text-red-600',
};

function FixturesTab({ tournament, onUpdateFixtures }: FixturesTabProps) {
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (f: TournamentFixture) => {
    onUpdateFixtures([...tournament.fixtures, f]);
    setShowAdd(false);
  };

  const cycleStatus = (id: string) => {
    const statusCycle: TournamentFixture['status'][] = ['scheduled', 'live', 'completed', 'abandoned'];
    onUpdateFixtures(tournament.fixtures.map(f => {
      if (f.id !== id) return f;
      const idx = statusCycle.indexOf(f.status);
      return { ...f, status: statusCycle[(idx + 1) % statusCycle.length] };
    }));
  };

  const removeFixture = (id: string) => {
    onUpdateFixtures(tournament.fixtures.filter(f => f.id !== id));
  };

  // Group by round
  const groups: Record<string, TournamentFixture[]> = {};
  for (const f of tournament.fixtures) {
    const r = f.round || 'Uncategorized';
    if (!groups[r]) groups[r] = [];
    groups[r].push(f);
  }
  const rounds = Object.keys(groups);

  return (
    <div className="flex flex-col gap-5">
      {showAdd && tournament.teams.length >= 2 && (
        <AddFixtureModal teams={tournament.teams} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
      {tournament.teams.length < 2 && showAdd && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">Need at least 2 teams to add fixtures.</div>
      )}

      {rounds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <List size={40} className="text-gray-200" />
          <p className="text-sm text-gray-400">No fixtures yet. Click "Add Fixture" to schedule matches.</p>
        </div>
      ) : (
        rounds.map(round => (
          <div key={round}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{round}</p>
            <div className="flex flex-col gap-2">
              {groups[round].map(f => (
                <div key={f.id} className="rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <TeamColorDot color={tournament.teams.find(t => t.id === f.teamAId)?.color ?? '#6b7280'} size={9} />
                        <span className="truncate">{f.teamAName}</span>
                        <span className="text-gray-300 font-normal">vs</span>
                        <TeamColorDot color={tournament.teams.find(t => t.id === f.teamBId)?.color ?? '#6b7280'} size={9} />
                        <span className="truncate">{f.teamBName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {f.venue && <span className="flex items-center gap-1"><MapPin size={11} />{f.venue}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(f.date)}</span>
                        {f.time && f.time !== '00:00' && <span className="flex items-center gap-1"><Clock size={11} />{f.time}</span>}
                      </div>
                      {f.result && <p className="text-xs font-semibold text-green-700 mt-1">{f.result}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => cycleStatus(f.id)} className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-opacity hover:opacity-70 ${FIXTURE_STATUS_COLORS[f.status]}`}>
                        {f.status}
                      </button>
                      <button onClick={() => removeFixture(f.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="self-start flex items-center gap-2 border border-dashed border-orange-300 text-orange-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
      >
        <Plus size={15} /> Add Fixture
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Leaderboards
// ─────────────────────────────────────────────
interface LeaderboardsTabProps {
  tournament: StoredTournament;
  onUpdateLeaderboards: (lb: TournamentLeaderboards) => void;
}

interface LeaderboardCardProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  entries: LocalLeaderboardEntry[];
  valueLabel: string;
  limit: number;
  onAddEntry: () => void;
}

function LeaderboardCard({ title, icon, accentColor, entries, valueLabel, limit, onAddEntry }: LeaderboardCardProps) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank).slice(0, limit);
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 font-bold text-sm text-gray-800" style={{ borderBottomWidth: 2, borderBottomColor: accentColor, borderBottomStyle: 'solid' }}>
        <span style={{ color: accentColor }}>{icon}</span>
        {title}
        <span className="ml-auto text-xs text-gray-400">Top {limit}</span>
      </div>
      {sorted.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-300">No entries yet.</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {sorted.map((e, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-xs font-black w-5 text-center" style={{ color: i === 0 ? accentColor : '#9ca3af' }}>#{e.rank}</span>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: e.teamColor }}>
                {e.playerName.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{e.playerName}</p>
                <p className="text-xs text-gray-400 truncate">{e.teamName}{e.extra ? ` · ${e.extra}` : ''}</p>
              </div>
              <span className="font-black text-sm" style={{ color: accentColor }}>{e.value} <span className="text-xs font-normal text-gray-400">{valueLabel}</span></span>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 py-2 border-t border-gray-50">
        <button onClick={onAddEntry} className="text-xs text-gray-400 hover:text-orange-500 font-semibold flex items-center gap-1 transition-colors">
          <Plus size={12} /> Add entry
        </button>
      </div>
    </div>
  );
}

function LeaderboardsTab({ tournament, onUpdateLeaderboards }: LeaderboardsTabProps) {
  const [addingType, setAddingType] = useState<'orangeCap' | 'purpleCap' | 'mostSixes' | 'bestEconomy' | null>(null);

  const handleAddEntry = (type: 'orangeCap' | 'purpleCap' | 'mostSixes' | 'bestEconomy') => (entry: LocalLeaderboardEntry) => {
    const updated: TournamentLeaderboards = {
      ...tournament.leaderboards,
      [type]: [...(tournament.leaderboards[type] ?? []), entry],
    };
    onUpdateLeaderboards(updated);
    setAddingType(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {addingType && (
        <AddLeaderboardEntryModal
          type={addingType}
          teams={tournament.teams}
          onClose={() => setAddingType(null)}
          onAdd={handleAddEntry(addingType)}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LeaderboardCard
          title="Orange Cap"
          icon={<Award size={16} />}
          accentColor="#f97316"
          entries={tournament.leaderboards.orangeCap ?? []}
          valueLabel="runs"
          limit={5}
          onAddEntry={() => setAddingType('orangeCap')}
        />
        <LeaderboardCard
          title="Purple Cap"
          icon={<Crosshair size={16} />}
          accentColor="#8b5cf6"
          entries={tournament.leaderboards.purpleCap ?? []}
          valueLabel="wkts"
          limit={5}
          onAddEntry={() => setAddingType('purpleCap')}
        />
        <LeaderboardCard
          title="Most Sixes"
          icon={<TrendingUp size={16} />}
          accentColor="#06b6d4"
          entries={tournament.leaderboards.mostSixes ?? []}
          valueLabel="sixes"
          limit={3}
          onAddEntry={() => setAddingType('mostSixes')}
        />
        <LeaderboardCard
          title="Best Economy"
          icon={<Zap size={16} />}
          accentColor="#22c55e"
          entries={tournament.leaderboards.bestEconomy ?? []}
          valueLabel="eco"
          limit={3}
          onAddEntry={() => setAddingType('bestEconomy')}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tournament Detail View
// ─────────────────────────────────────────────
type DetailTab = 'overview' | 'standings' | 'fixtures' | 'leaderboards';

interface TournamentDetailProps {
  tournament: StoredTournament;
  onBack: () => void;
  onUpdate: (t: StoredTournament) => void;
  onDelete: (id: string) => void;
}

function TournamentDetail({ tournament, onBack, onUpdate, onDelete }: TournamentDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Grid size={14} /> },
    { id: 'standings', label: 'Points Table', icon: <BarChart2 size={14} /> },
    { id: 'fixtures', label: 'Fixtures', icon: <List size={14} /> },
    { id: 'leaderboards', label: 'Leaderboards', icon: <Award size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-gray-900 truncate">{tournament.name}</h1>
          <p className="text-xs text-gray-400">{tournament.teams.length} teams · {tournament.fixtures.length} fixtures</p>
        </div>
        <StatusBadge status={tournament.status} />
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-100 mb-5 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
      {activeTab === 'standings' && (
        <PointsTableTab
          tournament={tournament}
          onUpdateStandings={standings => onUpdate({ ...tournament, standings })}
        />
      )}
      {activeTab === 'fixtures' && (
        <FixturesTab
          tournament={tournament}
          onUpdateFixtures={fixtures => onUpdate({ ...tournament, fixtures })}
        />
      )}
      {activeTab === 'leaderboards' && (
        <LeaderboardsTab
          tournament={tournament}
          onUpdateLeaderboards={leaderboards => onUpdate({ ...tournament, leaderboards })}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <Modal title="Delete Tournament?" onClose={() => setConfirmDelete(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              This will permanently delete <strong>{tournament.name}</strong> and all its fixtures, standings, and leaderboards. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => { onDelete(tournament.id); setConfirmDelete(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tournament Card (List view)
// ─────────────────────────────────────────────
interface TournamentCardProps {
  tournament: StoredTournament;
  onClick: () => void;
}

function TournamentCard({ tournament: t, onClick }: TournamentCardProps) {
  const primaryColor = t.teams[0]?.color ?? '#f97316';
  const formatLabel = FORMAT_OPTIONS.find(f => f.value === t.format)?.label ?? t.format;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
      style={{ borderLeftColor: primaryColor, borderLeftWidth: 4 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {t.shortName && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg" style={{ background: primaryColor + '20', color: primaryColor }}>
                  {t.shortName}
                </span>
              )}
              <StatusBadge status={t.status} />
            </div>
            <h3 className="text-base font-black text-gray-900 truncate group-hover:text-orange-600 transition-colors">
              {t.name}
            </h3>
            {t.organizer && <p className="text-xs text-gray-400 mt-0.5">by {t.organizer}</p>}
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition-colors" />
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          {t.city && (
            <span className="flex items-center gap-1"><MapPin size={11} />{t.city}</span>
          )}
          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(t.startDate)}</span>
          <span className="flex items-center gap-1"><Users size={11} />{t.teams.length} teams</span>
          <span className="flex items-center gap-1"><Zap size={11} />{t.overs}ov · {formatLabel}</span>
        </div>

        {/* Team color strip */}
        {t.teams.length > 0 && (
          <div className="flex gap-1 mt-3">
            {t.teams.slice(0, 10).map(team => (
              <div
                key={team.id}
                className="w-6 h-1.5 rounded-full"
                style={{ background: team.color }}
                title={team.name}
              />
            ))}
            {t.teams.length > 10 && (
              <span className="text-xs text-gray-300 ml-1">+{t.teams.length - 10}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
          <Trophy size={48} className="text-orange-200" />
        </div>
        <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
          <Plus size={18} className="text-white" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-800 mb-1">No Tournaments Yet</h2>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Organise your cricket tournaments with fixtures, standings, and leaderboards — all in one place.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-200 transition-all duration-200 hover:scale-105"
      >
        <Plus size={18} />
        Create your first tournament
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function TournamentManager({ currentPlan, onOpenPlans }: TournamentManagerProps) {
  const [tournaments, setTournaments] = useState<StoredTournament[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Load from localStorage once
  useEffect(() => {
    setTournaments(loadTournaments());
  }, []);

  const persist = useCallback((list: StoredTournament[]) => {
    setTournaments(list);
    saveTournaments(list);
  }, []);

  const handleCreate = (t: StoredTournament) => {
    const updated = [t, ...tournaments];
    persist(updated);
    setShowCreate(false);
    setSelectedId(t.id);
  };

  const handleUpdate = (updated: StoredTournament) => {
    persist(tournaments.map(t => t.id === updated.id ? updated : t));
  };

  const handleDelete = (id: string) => {
    persist(tournaments.filter(t => t.id !== id));
    setSelectedId(null);
  };

  const selectedTournament = tournaments.find(t => t.id === selectedId) ?? null;

  // Pro gate: free users can only have 1 tournament
  const isGated = currentPlan === 'free' && tournaments.length >= 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Create Modal */}
        {showCreate && (
          <CreateTournamentModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
        )}

        {/* Detail View */}
        {selectedTournament ? (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <TournamentDetail
              tournament={selectedTournament}
              onBack={() => setSelectedId(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <>
            {/* List View Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Tournaments</h1>
                <p className="text-sm text-gray-400">{tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}</p>
              </div>
              {tournaments.length > 0 && (
                isGated ? (
                  <button
                    onClick={onOpenPlans}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    <Star size={15} />
                    Upgrade to Add More
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md shadow-orange-200 transition-all duration-200 text-sm"
                  >
                    <Plus size={16} />
                    Create Tournament
                  </button>
                )
              )}
            </div>

            {/* Free plan banner */}
            {currentPlan === 'free' && tournaments.length > 0 && (
              <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
                <Star size={16} className="text-orange-400 flex-shrink-0" />
                <p className="text-sm text-gray-700 flex-1">
                  Free plan allows <strong>1 tournament</strong>. Upgrade to <strong>Pro</strong> for unlimited tournaments.
                </p>
                <button onClick={onOpenPlans} className="text-xs font-bold text-orange-500 hover:underline whitespace-nowrap">
                  Upgrade →
                </button>
              </div>
            )}

            {/* Tournament list or empty state */}
            {tournaments.length === 0 ? (
              <EmptyState onCreate={() => setShowCreate(true)} />
            ) : (
              <div className="flex flex-col gap-3">
                {tournaments.map(t => (
                  <TournamentCard key={t.id} tournament={t} onClick={() => setSelectedId(t.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
