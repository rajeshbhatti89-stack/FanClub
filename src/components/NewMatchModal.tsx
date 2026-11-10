import React, { useState, useRef, useCallback } from 'react';
import type { Match, Team, Player, BallType, MatchFormat, ObsThemeId, Tournament } from '../types/cricket';
import { makeNewMatch, makeBlankPlayer, makeBlankTeam } from '../data/initialState';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Trophy,
  MapPin,
  Calendar,
  Users,
  Upload,
  CheckCircle,
  Circle,
  Shuffle,
  Star,
  Shield,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (match: Match) => void;
  existingTournaments?: Tournament[];
}

interface TeamFormState {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string | undefined;
  players: string[]; // names
  captainIndex: number | null;
  wicketkeeperIndex: number | null;
}

type TossDecision = 'bat' | 'bowl';

// ─── Constants ───────────────────────────────────────────────────────────────

const FORMAT_OVERS: Record<MatchFormat, number> = {
  T20: 20,
  ODI: 50,
  Test: 90,
  T10: 10,
  'Box Cricket': 6,
  Custom: 20,
};

const BALL_TYPES: { value: BallType; label: string; emoji: string }[] = [
  { value: 'leather_white', label: 'Leather White', emoji: '⚪' },
  { value: 'leather_red', label: 'Leather Red', emoji: '🔴' },
  { value: 'leather_pink', label: 'Leather Pink', emoji: '🩷' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'rubber', label: 'Rubber', emoji: '🟤' },
];

const OBS_THEMES: { id: ObsThemeId; label: string; emoji: string; gradient: string; description: string }[] = [
  {
    id: 'wcFinal',
    label: 'WC Final',
    emoji: '🏆',
    gradient: 'from-yellow-600 via-yellow-500 to-amber-400',
    description: 'World Cup Final',
  },
  {
    id: 'asiaCup',
    label: 'Asia Cup',
    emoji: '🌿',
    gradient: 'from-green-700 via-emerald-600 to-teal-500',
    description: 'Asia Cup Classic',
  },
  {
    id: 'sunsetIPL',
    label: 'Sunset IPL',
    emoji: '🌅',
    gradient: 'from-orange-600 via-pink-500 to-purple-600',
    description: 'IPL Sunset Vibes',
  },
  {
    id: 'teamCustom',
    label: 'Team Custom',
    emoji: '🎨',
    gradient: 'from-blue-600 via-indigo-500 to-violet-500',
    description: 'Custom Team Colors',
  },
];

const COLOR_PRESETS = [
  '#1E3A8A', // blue
  '#DC2626', // red
  '#CA8A04', // yellow
  '#16A34A', // green
  '#7C3AED', // purple
  '#EA580C', // orange
  '#881337', // maroon
  '#1C1917', // black
];

const TEAM_PRESETS: { label: string; color: string; secondary: string; short: string }[] = [
  { label: 'IND', color: '#003399', secondary: '#FF6600', short: 'IND' },
  { label: 'AUS', color: '#FFCD00', secondary: '#00843D', short: 'AUS' },
  { label: 'PAK', color: '#01411C', secondary: '#FFFFFF', short: 'PAK' },
  { label: 'ENG', color: '#CF142B', secondary: '#FFFFFF', short: 'ENG' },
  { label: 'SA', color: '#007A4D', secondary: '#FFB81C', short: 'SA' },
  { label: 'NZ', color: '#000000', secondary: '#FFFFFF', short: 'NZ' },
  { label: 'SL', color: '#00247D', secondary: '#FFD100', short: 'SL' },
  { label: 'WI', color: '#7B0046', secondary: '#FDB913', short: 'WI' },
  { label: 'BAN', color: '#006A4E', secondary: '#F42A41', short: 'BAN' },
];

const TOTAL_STEPS = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildTeamFromForm(form: TeamFormState, teamId: string): Team {
  const players: Player[] = form.players
    .map((name, idx) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const p = makeBlankPlayer(`${teamId}-p${idx}`, trimmed);
      if (idx === form.captainIndex) p.role = 'allrounder';
      if (idx === form.wicketkeeperIndex) p.role = 'wicketkeeper';
      return p;
    })
    .filter((p): p is Player => p !== null);

  return {
    ...makeBlankTeam(teamId, form.name.trim(), form.shortName.trim().toUpperCase(), form.primaryColor),
    secondaryColor: form.secondaryColor,
    logo: form.logo,
    players,
    captain: form.captainIndex !== null ? `${teamId}-p${form.captainIndex}` : undefined,
    wicketkeeper: form.wicketkeeperIndex !== null ? `${teamId}-p${form.wicketkeeperIndex}` : undefined,
  };
}

function getDefaultTeamForm(): TeamFormState {
  return {
    name: '',
    shortName: '',
    primaryColor: '#1E3A8A',
    secondaryColor: '#FFFFFF',
    logo: undefined,
    players: Array(11).fill(''),
    captainIndex: null,
    wicketkeeperIndex: null,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: number;
}
function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { n: 1, label: 'Match Setup' },
    { n: 2, label: 'Team A' },
    { n: 3, label: 'Team B' },
    { n: 4, label: 'Toss' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6 select-none">
      {steps.map((step, i) => {
        const done = step.n < currentStep;
        const active = step.n === currentStep;
        return (
          <React.Fragment key={step.n}>
            <div className="flex flex-col items-center gap-1 w-16">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  done
                    ? 'bg-green-500 border-green-500 text-white'
                    : active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : step.n}
              </div>
              <span
                className={`text-xs font-medium ${
                  active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mt-[-14px] transition-all duration-300 ${
                  step.n < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}
function ColorSwatch({ color, selected, onClick }: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
        selected ? 'border-gray-700 scale-110 shadow-md' : 'border-transparent'
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function inputCls(error?: boolean) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-400 focus:ring-red-300'
      : 'border-gray-300 focus:ring-blue-300 focus:border-blue-400'
  }`;
}

// ─── Team Form Component ──────────────────────────────────────────────────────

interface TeamFormProps {
  teamLabel: 'A' | 'B';
  form: TeamFormState;
  onChange: (form: TeamFormState) => void;
  errors: Record<string, string>;
}

function TeamForm({ teamLabel, form, onChange, errors }: TeamFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof TeamFormState>(key: K, val: TeamFormState[K]) => {
    onChange({ ...form, [key]: val });
  };

  const handlePlayerName = (idx: number, val: string) => {
    const players = [...form.players];
    players[idx] = val;
    onChange({ ...form, players });
  };

  const addPlayer = () => {
    onChange({ ...form, players: [...form.players, ''] });
  };

  const removePlayer = (idx: number) => {
    if (form.players.length <= 1) return;
    const players = form.players.filter((_, i) => i !== idx);
    const captainIndex = form.captainIndex === idx ? null : form.captainIndex !== null && form.captainIndex > idx ? form.captainIndex - 1 : form.captainIndex;
    const wicketkeeperIndex = form.wicketkeeperIndex === idx ? null : form.wicketkeeperIndex !== null && form.wicketkeeperIndex > idx ? form.wicketkeeperIndex - 1 : form.wicketkeeperIndex;
    onChange({ ...form, players, captainIndex, wicketkeeperIndex });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setField('logo', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const namedPlayers = form.players
    .map((name, idx) => ({ name: name.trim(), idx }))
    .filter((p) => p.name.length > 0);

  const applyPreset = (preset: (typeof TEAM_PRESETS)[0]) => {
    onChange({
      ...form,
      name: preset.label,
      shortName: preset.short,
      primaryColor: preset.color,
      secondaryColor: preset.secondary,
    });
  };

  return (
    <div className="space-y-5">
      {/* Quick presets */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {TEAM_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              style={{ color: preset.color, borderColor: preset.color + '55' }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Team Name & Short Name */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label={`Team ${teamLabel} Name`} required>
            <input
              type="text"
              className={inputCls(!!errors.name)}
              placeholder={`e.g. Royal Challengers`}
              value={form.name}
              maxLength={40}
              onChange={(e) => setField('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </Field>
        </div>
        <Field label="Short Name" required hint="Max 3 chars">
          <input
            type="text"
            className={inputCls(!!errors.shortName)}
            placeholder="e.g. RCB"
            value={form.shortName}
            maxLength={3}
            onChange={(e) => setField('shortName', e.target.value.toUpperCase())}
          />
          {errors.shortName && <p className="text-xs text-red-500 mt-0.5">{errors.shortName}</p>}
        </Field>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setField('primaryColor', e.target.value)}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <div className="flex gap-1 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  selected={form.primaryColor === c}
                  onClick={() => setField('primaryColor', c)}
                />
              ))}
            </div>
          </div>
        </Field>
        <Field label="Secondary Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.secondaryColor}
              onChange={(e) => setField('secondaryColor', e.target.value)}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <div className="flex gap-1 flex-wrap">
              {['#FFFFFF', '#F5F5F5', '#FCD34D', '#6EE7B7', '#93C5FD', '#F9A8D4'].map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  selected={form.secondaryColor === c}
                  onClick={() => setField('secondaryColor', c)}
                />
              ))}
            </div>
          </div>
        </Field>
      </div>

      {/* Logo */}
      <Field label="Team Logo" hint="Optional — PNG/JPG, square recommended">
        <div className="flex items-center gap-3">
          {form.logo ? (
            <div className="relative">
              <img
                src={form.logo}
                alt="Team logo"
                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow"
              />
              <button
                type="button"
                onClick={() => setField('logo', undefined)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-blue-600 hover:underline"
          >
            {form.logo ? 'Change Logo' : 'Upload Logo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
      </Field>

      {/* Players */}
      <Field label="Playing XI" required hint="At least 2 players required">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {form.players.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}.</span>
              <input
                type="text"
                className={inputCls()}
                placeholder={`Player ${idx + 1} name`}
                value={name}
                onChange={(e) => handlePlayerName(idx, e.target.value)}
              />
              {form.players.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePlayer(idx)}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.players && <p className="text-xs text-red-500 mt-1">{errors.players}</p>}
        <button
          type="button"
          onClick={addPlayer}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          + Add Player
        </button>
      </Field>

      {/* Captain & WK selectors */}
      {namedPlayers.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Captain">
            <div className="relative">
              <Star className="w-4 h-4 text-yellow-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <select
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white"
                value={form.captainIndex ?? ''}
                onChange={(e) =>
                  setField('captainIndex', e.target.value === '' ? null : Number(e.target.value))
                }
              >
                <option value="">Select captain</option>
                {namedPlayers.map((p) => (
                  <option key={p.idx} value={p.idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Wicket-Keeper">
            <div className="relative">
              <Shield className="w-4 h-4 text-blue-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <select
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white"
                value={form.wicketkeeperIndex ?? ''}
                onChange={(e) =>
                  setField(
                    'wicketkeeperIndex',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
              >
                <option value="">Select keeper</option>
                {namedPlayers.map((p) => (
                  <option key={p.idx} value={p.idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function NewMatchModal({
  isOpen,
  onClose,
  onCreateMatch,
  existingTournaments = [],
}: NewMatchModalProps) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [overs, setOvers] = useState(20);
  const [maxOversBowler, setMaxOversBowler] = useState(4);
  const [ballType, setBallType] = useState<BallType>('leather_white');
  const [obsTheme, setObsTheme] = useState<ObsThemeId>('wcFinal');
  const [tournamentId, setTournamentId] = useState<string>('');

  // Step 2 & 3 state
  const [teamAForm, setTeamAForm] = useState<TeamFormState>(getDefaultTeamForm());
  const [teamBForm, setTeamBForm] = useState<TeamFormState>(getDefaultTeamForm());

  // Step 4 state
  const [tossWinner, setTossWinner] = useState<'A' | 'B'>('A');
  const [tossDecision, setTossDecision] = useState<TossDecision>('bat');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormatChange = useCallback((f: MatchFormat) => {
    setFormat(f);
    const o = FORMAT_OVERS[f];
    setOvers(o);
    setMaxOversBowler(Math.ceil(o / 5));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim()) errs.title = 'Match title is required';
      if (!venue.trim()) errs.venue = 'Venue is required';
      if (overs < 1) errs.overs = 'Overs must be at least 1';
    }

    if (step === 2) {
      if (!teamAForm.name.trim()) errs.name = 'Team name is required';
      if (!teamAForm.shortName.trim()) errs.shortName = 'Short name is required';
      const named = teamAForm.players.filter((p) => p.trim().length > 0);
      if (named.length < 2) errs.players = 'At least 2 players required';
    }

    if (step === 3) {
      if (!teamBForm.name.trim()) errs.name = 'Team name is required';
      if (!teamBForm.shortName.trim()) errs.shortName = 'Short name is required';
      const named = teamBForm.players.filter((p) => p.trim().length > 0);
      if (named.length < 2) errs.players = 'At least 2 players required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // ── Create Match ──────────────────────────────────────────────────────────
  const handleStartMatch = () => {
    const teamAId = `team-a-${generateId()}`;
    const teamBId = `team-b-${generateId()}`;
    const teamA = buildTeamFromForm(teamAForm, teamAId);
    const teamB = buildTeamFromForm(teamBForm, teamBId);
    const tossWinnerId = tossWinner === 'A' ? teamAId : teamBId;

    const match = makeNewMatch(
      teamA,
      teamB,
      overs,
      title.trim(),
      venue.trim(),
      city.trim(),
      obsTheme,
      ballType,
      format,
      tossWinnerId,
      tossDecision,
      tournamentId || undefined
    );

    onCreateMatch(match);
    onClose();
  };

  if (!isOpen) return null;

  // ── Step Content ───────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      <Field label="Match Title" required>
        <input
          type="text"
          className={inputCls(!!errors.title)}
          placeholder="e.g. Friday Night T20 — Mumbai"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Venue" required>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              className={`${inputCls(!!errors.venue)} pl-8`}
              placeholder="Stadium / Ground"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>
          {errors.venue && <p className="text-xs text-red-500 mt-0.5">{errors.venue}</p>}
        </Field>

        <Field label="City">
          <input
            type="text"
            className={inputCls()}
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Date">
        <div className="relative">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="date"
            className={`${inputCls()} pl-8`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Field>

      {/* Match Format */}
      <Field label="Match Format">
        <div className="grid grid-cols-3 gap-2">
          {(['T20', 'ODI', 'T10', 'Box Cricket', 'Custom'] as MatchFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleFormatChange(f)}
              className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                format === f
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Field>

      {/* Overs */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Overs" required>
          <input
            type="number"
            className={inputCls(!!errors.overs)}
            min={1}
            max={999}
            value={overs}
            onChange={(e) => {
              const v = Number(e.target.value);
              setOvers(v);
              setMaxOversBowler(Math.ceil(v / 5));
            }}
          />
          {errors.overs && <p className="text-xs text-red-500 mt-0.5">{errors.overs}</p>}
        </Field>
        <Field label="Max Overs/Bowler" hint="Auto = overs ÷ 5">
          <input
            type="number"
            className={inputCls()}
            min={1}
            value={maxOversBowler}
            onChange={(e) => setMaxOversBowler(Number(e.target.value))}
          />
        </Field>
      </div>

      {/* Ball Type */}
      <Field label="Ball Type">
        <div className="flex flex-wrap gap-2">
          {BALL_TYPES.map((bt) => (
            <button
              key={bt.value}
              type="button"
              onClick={() => setBallType(bt.value)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm border-2 font-medium transition-all ${
                ballType === bt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              <span>{bt.emoji}</span>
              {bt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* OBS Theme */}
      <Field label="OBS Broadcast Theme">
        <div className="grid grid-cols-2 gap-3">
          {OBS_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setObsTheme(theme.id)}
              className={`relative rounded-xl overflow-hidden h-20 flex flex-col items-center justify-center gap-1 border-3 transition-all ${
                obsTheme === theme.id
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-[1.02]'
                  : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
              {obsTheme === theme.id && (
                <div className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                </div>
              )}
              <span className="relative text-2xl">{theme.emoji}</span>
              <span className="relative text-white text-xs font-bold drop-shadow">{theme.label}</span>
              <span className="relative text-white/80 text-[10px]">{theme.description}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Tournament */}
      <Field label="Tournament" hint="Optional">
        <div className="relative">
          <Trophy className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <select
            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
          >
            <option value="">No Tournament / Standalone Match</option>
            {existingTournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </Field>
    </div>
  );

  const renderStep2 = () => (
    <TeamForm
      teamLabel="A"
      form={teamAForm}
      onChange={setTeamAForm}
      errors={errors}
    />
  );

  const renderStep3 = () => (
    <TeamForm
      teamLabel="B"
      form={teamBForm}
      onChange={setTeamBForm}
      errors={errors}
    />
  );

  const renderStep4 = () => {
    const teamAName = teamAForm.name.trim() || 'Team A';
    const teamBName = teamBForm.name.trim() || 'Team B';
    const tossWinnerName = tossWinner === 'A' ? teamAName : teamBName;

    return (
      <div className="space-y-6">
        {/* Summary card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
            Match Summary
          </p>
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="flex flex-col items-center gap-2 w-32">
              {teamAForm.logo ? (
                <img src={teamAForm.logo} alt={teamAName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
                  style={{ backgroundColor: teamAForm.primaryColor }}
                >
                  {teamAForm.shortName || 'A'}
                </div>
              )}
              <span className="text-sm font-bold text-gray-800 text-center leading-tight">{teamAName}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: teamAForm.primaryColor }}
              >
                {teamAForm.players.filter((p) => p.trim()).length} Players
              </span>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-gray-300">VS</span>
              <span className="text-xs text-gray-500 font-medium">{format}</span>
              <span className="text-xs text-gray-500">{overs} overs</span>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-2 w-32">
              {teamBForm.logo ? (
                <img src={teamBForm.logo} alt={teamBName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
                  style={{ backgroundColor: teamBForm.primaryColor }}
                >
                  {teamBForm.shortName || 'B'}
                </div>
              )}
              <span className="text-sm font-bold text-gray-800 text-center leading-tight">{teamBName}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: teamBForm.primaryColor }}
              >
                {teamBForm.players.filter((p) => p.trim()).length} Players
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-100 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
            <div>
              <MapPin className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
              <span className="font-medium">{venue || '—'}</span>
            </div>
            <div>
              <Calendar className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
              <span className="font-medium">{date}</span>
            </div>
            <div>
              <span className="block text-lg mb-0.5">
                {BALL_TYPES.find((b) => b.value === ballType)?.emoji ?? '⚪'}
              </span>
              <span className="font-medium">{BALL_TYPES.find((b) => b.value === ballType)?.label}</span>
            </div>
          </div>
        </div>

        {/* Toss Winner */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Shuffle className="w-4 h-4 text-gray-500" />
            Toss Winner
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['A', 'B'] as const).map((side) => {
              const name = side === 'A' ? teamAName : teamBName;
              const form = side === 'A' ? teamAForm : teamBForm;
              const isSelected = tossWinner === side;
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => setTossWinner(side)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {form.logo ? (
                    <img src={form.logo} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: form.primaryColor }}
                    >
                      {form.shortName || side}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700 text-left leading-tight">{name}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-blue-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toss Decision */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {tossWinner === 'A' ? teamAName : teamBName} elected to…
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['bat', 'bowl'] as TossDecision[]).map((dec) => (
              <button
                key={dec}
                type="button"
                onClick={() => setTossDecision(dec)}
                className={`py-3 rounded-xl border-2 font-bold text-base capitalize transition-all ${
                  tossDecision === dec
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                {dec === 'bat' ? '🏏 Bat First' : '⚾ Bowl First'}
              </button>
            ))}
          </div>
        </div>

        {/* Toss summary line */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 text-center border border-gray-100">
          <strong>{tossWinnerName}</strong> won the toss and elected to{' '}
          <strong>{tossDecision === 'bat' ? '🏏 bat' : '⚾ bowl'}</strong> first.
        </div>
      </div>
    );
  };

  const stepTitles: Record<number, string> = {
    1: 'Match Setup',
    2: `Team A — ${teamAForm.name || 'Setup'}`,
    3: `Team B — ${teamBForm.name || 'Setup'}`,
    4: 'Toss & Start',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">New Match</h2>
              <p className="text-xs text-gray-500">{stepTitles[step]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-5 shrink-0">
          <StepIndicator currentStep={step} />
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={step === 1 ? onClose : prevStep}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <span className="text-xs text-gray-400 font-medium">
            Step {step} of {TOTAL_STEPS}
          </span>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartMatch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-100"
            >
              <Users className="w-4 h-4" />
              Start Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
