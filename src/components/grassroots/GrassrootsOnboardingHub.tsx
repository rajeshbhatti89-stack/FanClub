// ============================================================
// FAN CLUB — Grassroots Player Onboarding Hub
// Authorized Excel/CSV Roster Uploads, Village/District, Corporate,
// School/College, Tennis-Ball, and Women's Cricket Pipelines
// ============================================================
import React, { useState, useRef } from 'react';
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  X, 
  FileText, 
  RotateCcw, 
  Info, 
  Award, 
  Layers, 
  Building2, 
  GraduationCap, 
  Trophy, 
  HeartHandshake,
  Check,
  ChevronRight
} from 'lucide-react';
import type { GrassrootsCategory } from '../../types/cricket';
import { realPlayerAcquisitionEngine, type AcquisitionBatchProgress } from '../../services/realPlayerAcquisition';
import { db } from '../../db/database';

interface GrassrootsCategoryCard {
  id: GrassrootsCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  description: string;
  targetLeagues: string;
}

const CATEGORIES: GrassrootsCategoryCard[] = [
  {
    id: 'village_district',
    title: 'Village & District Teams',
    subtitle: 'Gram Panchayat & Tehsil Tournaments',
    icon: <Trophy className="text-amber-400" size={24} />,
    badge: 'RURAL CRICKET',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Onboard local village teams, taluka mandals, rural cups, and district association squads.',
    targetLeagues: 'Koli Premier League, Grampanchayat Cups, District T20 Trophies',
  },
  {
    id: 'corporate',
    title: 'Corporate Tournaments',
    subtitle: 'IT, Banking & Enterprise Leagues',
    icon: <Building2 className="text-cyan-400" size={24} />,
    badge: 'CORPORATE T20',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Bring working professionals and corporate teams into official player registry with company rosters.',
    targetLeagues: 'Tech Park Leagues, Banking Shields, Corporate T20 Championships',
  },
  {
    id: 'school_college',
    title: 'School & College Teams',
    subtitle: 'Inter-School & University Youth',
    icon: <GraduationCap className="text-emerald-400" size={24} />,
    badge: 'YOUTH TALENT',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Register budding school players, inter-collegiate squads, and junior academy cricketers.',
    targetLeagues: 'Harris Shield, Giles Shield, All-India Inter-University Tournaments',
  },
  {
    id: 'tennis_ball',
    title: 'Tennis-Ball & Amateur',
    subtitle: 'Box Cricket & Night Tournaments',
    icon: <Layers className="text-rose-400" size={24} />,
    badge: 'OPEN GRASSROOTS',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'High-speed tennis ball cricket stars, overarm night tournaments, and city box cricket heroes.',
    targetLeagues: 'Supremo Cup, Tennis Premier League, Local Night Cricket',
  },
  {
    id: 'womens_cricket',
    title: "Women's Cricket",
    subtitle: 'District, Academy & Amateur Leagues',
    icon: <Award className="text-purple-400" size={24} />,
    badge: "WOMEN'S TALENT",
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Empower female cricketers from district associations, colleges, and grassroots academies.',
    targetLeagues: "District Women's T20, Grassroots Women's Premier Cups",
  },
  {
    id: 'city_club',
    title: 'City & State Clubs',
    subtitle: 'Affiliated Gymkhanas & Academies',
    icon: <ShieldCheck className="text-blue-400" size={24} />,
    badge: 'CLUB CRICKET',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Register traditional gymkhanas, local league clubs, and city coaching academy rosters.',
    targetLeagues: 'Kanga League, DDCA League, TNCA League Divisions',
  },
];

interface GrassrootsOnboardingHubProps {
  onNavigateToClaim?: () => void;
  onNavigateToPlayers?: () => void;
}

export const GrassrootsOnboardingHub: React.FC<GrassrootsOnboardingHubProps> = ({
  onNavigateToClaim,
  onNavigateToPlayers,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GrassrootsCategory>('village_district');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [managerNameInput, setManagerNameInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileType, setFileType] = useState<'xlsx' | 'xls' | 'csv' | 'json'>('xlsx');
  const [progress, setProgress] = useState<AcquisitionBatchProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBatchId, setCompletedBatchId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const csvContent = realPlayerAcquisitionEngine.generateTemplateCsv(selectedCategory);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fanclub_${selectedCategory}_roster_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', `Downloaded template for ${selectedCategory.replace('_', ' ')}.`);
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const { rows, fileType: detectedType } = realPlayerAcquisitionEngine.parseFileContent(buffer, file.name);
      
      if (rows.length === 0) {
        showNotification('error', 'Uploaded file contains 0 valid data rows.');
        return;
      }

      setUploadedFile(file);
      setParsedRows(rows);
      setFileType(detectedType as any);
      showNotification('info', `Loaded ${rows.length} player rows from "${file.name}". Ready to import.`);
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Failed to parse file: ${err?.message || 'Invalid format'}`);
    }
  };

  // Immediate genuine sample pack loader
  const handleLoadGenuineSample = () => {
    const sampleRows = realPlayerAcquisitionEngine.getGenuineGrassrootsSamplePack(selectedCategory);
    setParsedRows(sampleRows);
    setUploadedFile({ name: `${selectedCategory}_verified_sample.xlsx` } as File);
    setFileType('xlsx');
    showNotification('info', `Loaded genuine authorized ${selectedCategory.replace('_', ' ')} sample dataset (${sampleRows.length} real players).`);
  };

  // Start Asynchronous Chunked Batch Ingestion
  const handleStartImport = async () => {
    if (parsedRows.length === 0) {
      showNotification('error', 'No player rows to import. Please upload a file or load sample.');
      return;
    }

    setIsProcessing(true);
    setCompletedBatchId(null);

    try {
      const batchRecord = await realPlayerAcquisitionEngine.processBatchAsync(parsedRows, {
        fileName: uploadedFile?.name || `${selectedCategory}_roster.xlsx`,
        fileType,
        source: 'team_roster_upload',
        grassrootsCategory: selectedCategory,
        defaultTeamName: teamNameInput.trim() || undefined,
        uploadedBy: managerNameInput.trim() || 'Team Manager',
        onProgress: (p) => setProgress({ ...p }),
      });

      setCompletedBatchId(batchRecord.batchId);
      setIsProcessing(false);
      showNotification(
        'success',
        `Successfully imported ${batchRecord.importedCount} genuine players (${batchRecord.duplicateCount} duplicates identified)!`
      );
    } catch (err: any) {
      setIsProcessing(false);
      showNotification('error', `Batch processing failed: ${err?.message || 'Unknown error'}`);
    }
  };

  // Rollback this specific batch
  const handleRollback = () => {
    if (!completedBatchId) return;
    const res = db.rollbackBatch(completedBatchId);
    if (res.success) {
      showNotification('info', res.message);
      setCompletedBatchId(null);
      setProgress(null);
    } else {
      showNotification('error', res.message);
    }
  };

  const currentCatObj = CATEGORIES.find(c => c.id === selectedCategory)!;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-100">
      {/* Header Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 size={16} />}
            {notification.type === 'error' && <AlertTriangle size={16} />}
            {notification.type === 'info' && <Info size={16} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-widest uppercase mb-3">
            <ShieldCheck size={14} /> NO-API GENUINE PLAYER ACQUISITION PIPELINE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Grassroots Cricket Onboarding Hub
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Acquire real, verifiable Indian cricket players directly from authorized team owners, tournament directors, and village captains.
            Parse multi-format Excel spreadsheets (<code className="text-emerald-400 font-mono text-xs">.xlsx</code>, <code className="text-emerald-400 font-mono text-xs">.xls</code>) and CSV rosters with non-blocking batch execution, zero fabricated statistics, and one-click rollback security.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download size={14} /> Download Verified Roster Template (.csv)
            </button>

            <button
              onClick={handleLoadGenuineSample}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Sparkles size={14} className="text-amber-400" /> Load Genuine {currentCatObj.title} Roster
            </button>

            {onNavigateToClaim && (
              <button
                onClick={onNavigateToClaim}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
              >
                <HeartHandshake size={14} /> Player Claim Portal
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Step 1: Grassroots Categories */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
              Select Grassroots Division
            </h2>
            <p className="text-xs text-slate-400">Choose the cricket category to tailor column mapping, verification rules, and digital passports.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mt-3">{cat.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{cat.subtitle}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px] text-slate-500">e.g. {cat.targetLeagues}</span>
                  {isSelected && <Check size={14} className="text-emerald-400 font-bold" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Upload or Review Roster */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Upload Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-base font-black text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
              Roster Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Team / Club Name (Default)</label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. Shirwal Village XI, Persistent IT Cup"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Uploaded By (Manager / Scorer)</label>
                <input
                  type="text"
                  value={managerNameInput}
                  onChange={(e) => setManagerNameInput(e.target.value)}
                  placeholder="e.g. Rajesh Bhatti (Team Captain)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv,.tsv,.json"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 hover:bg-slate-950 text-center cursor-pointer transition-all group"
                >
                  <FileSpreadsheet className="mx-auto text-slate-500 group-hover:text-emerald-400 transition-colors" size={32} />
                  <p className="text-xs font-bold text-slate-200 mt-2">
                    {uploadedFile ? uploadedFile.name : 'Choose Excel or CSV Roster'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports .xlsx, .xls, .csv, .json</p>
                </div>
              </div>

              {/* Strict Real Data Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Info size={13} /> Real Data Strict Enforcement
                </div>
                <p>
                  Missing runs or wickets will stay <code className="text-slate-300 font-mono">undefined</code>. Fan Club never fabricates statistics. All profiles enter with <strong>unverified grassroots status</strong> with original file provenance.
                </p>
              </div>

              {/* Start Ingestion Button */}
              <button
                onClick={handleStartImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/20"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="animate-spin" size={15} />
                    Processing {parsedRows.length} Records...
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    Import {parsedRows.length} Players into Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Roster Preview & Progress */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Tracker Card (Shown when processing or completed) */}
          {progress && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <RotateCcw size={14} className={isProcessing ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
                  {progress.currentStage}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{progress.percentComplete}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>

              {/* Progress Counters */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">New Added</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{progress.addedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Updated</div>
                  <div className="text-sm font-black text-cyan-400 mt-0.5">{progress.updatedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Duplicates</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">{progress.duplicateCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Processed</div>
                  <div className="text-sm font-black text-white mt-0.5">{progress.processedRows}/{progress.totalRows}</div>
                </div>
              </div>

              {/* Completed Actions & Rollback */}
              {completedBatchId && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Batch {completedBatchId} Persisted
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRollback}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                    >
                      Rollback Batch
                    </button>

                    {onNavigateToPlayers && (
                      <button
                        onClick={onNavigateToPlayers}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1"
                      >
                        View in Registry <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Roster Live Preview Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-white text-sm">
                  Parsed Roster Preview ({parsedRows.length} Players)
                </h3>
                <p className="text-xs text-slate-400">Review mapped columns and real statistics before writing to database.</p>
              </div>

              {parsedRows.length > 0 && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  {uploadedFile?.name || 'custom_upload'}
                </span>
              )}
            </div>

            {parsedRows.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <FileSpreadsheet className="mx-auto mb-2 text-slate-600" size={32} />
                <p className="text-xs font-bold">No roster data loaded yet.</p>
                <p className="text-[11px] mt-1">Upload an Excel/CSV file or click "Load Genuine Roster" above to preview.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Bat / Bowl</th>
                      <th className="py-2.5 px-3">City / Team</th>
                      <th className="py-2.5 px-3">Real Stats</th>
                      <th className="py-2.5 px-3">CricHeroes ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {parsedRows.slice(0, 50).map((row, idx) => {
                      const name = row['Player Name'] || row.name || row.player_name || row['Full Name'] || 'Unknown';
                      const role = row.Role || row.role || 'batsman';
                      const bat = row.Batting || row.batting_style || row['Batting Style'] || 'RHB';
                      const bowl = row.Bowling || row.bowling_style || row['Bowling Style'] || '-';
                      const city = row.City || row.city || row.District || '-';
                      const team = row.Team || row.team || row['Team Name'] || teamNameInput || '-';
                      const matches = row.Matches || row.matches || row.m;
                      const runs = row.Runs || row.runs || row.r;
                      const wickets = row.Wickets || row.wickets || row.w;
                      const chId = row.CricHeroesID || row['CricHeroes ID'] || row.cricheroes_id || '-';

                      return (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-white">{name}</td>
                          <td className="py-2 px-3 capitalize text-slate-300">{role}</td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">{bat} • {bowl}</td>
                          <td className="py-2 px-3 text-slate-300">
                            <span className="font-semibold text-white">{city}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{team}</span>
                          </td>
                          <td className="py-2 px-3 text-emerald-400 font-mono text-[11px]">
                            {matches !== undefined ? `${matches}M • ${runs || 0}R • ${wickets || 0}W` : <span className="text-slate-500 italic">No historical stats</span>}
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-amber-300">{chId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
