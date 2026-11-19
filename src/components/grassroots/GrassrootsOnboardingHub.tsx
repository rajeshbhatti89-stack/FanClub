// ============================================================
// FAN CLUB — Grassroots Player Onboarding Hub
// Authorized Excel/CSV Roster Uploads in Daytime Light Theme
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
    icon: <Trophy className="text-amber-600" size={24} />,
    badge: 'RURAL CRICKET',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Onboard local village teams, taluka mandals, rural cups, and district association squads.',
    targetLeagues: 'Koli Premier League, Grampanchayat Cups, District T20 Trophies',
  },
  {
    id: 'corporate',
    title: 'Corporate Tournaments',
    subtitle: 'IT, Banking & Enterprise Leagues',
    icon: <Building2 className="text-sky-600" size={24} />,
    badge: 'CORPORATE T20',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    description: 'Bring working professionals and corporate teams into official player registry with company rosters.',
    targetLeagues: 'Tech Park Leagues, Banking Shields, Corporate T20 Championships',
  },
  {
    id: 'school_college',
    title: 'School & College Teams',
    subtitle: 'Inter-School & University Youth',
    icon: <GraduationCap className="text-emerald-600" size={24} />,
    badge: 'YOUTH TALENT',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Register budding school players, inter-collegiate squads, and junior academy cricketers.',
    targetLeagues: 'Harris Shield, Giles Shield, All-India Inter-University Tournaments',
  },
  {
    id: 'tennis_ball',
    title: 'Tennis-Ball & Amateur',
    subtitle: 'Box Cricket & Night Tournaments',
    icon: <Layers className="text-rose-600" size={24} />,
    badge: 'OPEN GRASSROOTS',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'High-speed tennis ball cricket stars, overarm night tournaments, and city box cricket heroes.',
    targetLeagues: 'Supremo Cup, Tennis Premier League, Local Night Cricket',
  },
  {
    id: 'womens_cricket',
    title: "Women's Cricket",
    subtitle: 'District, Academy & Amateur Leagues',
    icon: <Award className="text-purple-600" size={24} />,
    badge: "WOMEN'S TALENT",
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Empower female cricketers from district associations, colleges, and grassroots academies.',
    targetLeagues: "District Women's T20, Grassroots Women's Premier Cups",
  },
  {
    id: 'city_club',
    title: 'City & State Clubs',
    subtitle: 'Affiliated Gymkhanas & Academies',
    icon: <ShieldCheck className="text-blue-600" size={24} />,
    badge: 'CLUB LEVEL',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Official club leagues, traditional gymkhanas, and state association development tournaments.',
    targetLeagues: 'Kanga League, DDCA League, KSCA 1st-4th Divisions',
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

  const currentCatObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-900">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between mb-6 shadow-sm animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-sky-50 border-sky-300 text-sky-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
            {notification.type === 'error' && <AlertTriangle size={16} className="text-rose-600" />}
            {notification.type === 'info' && <Info size={16} className="text-sky-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black tracking-widest uppercase mb-3">
            <ShieldCheck size={14} className="text-emerald-700" /> NO-API GENUINE PLAYER ACQUISITION PIPELINE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Grassroots Cricket Onboarding Hub
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Acquire real, verifiable Indian cricket players directly from authorized team owners, tournament directors, and village captains.
            Parse multi-format Excel spreadsheets (<code className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-mono text-xs font-bold">.xlsx</code>, <code className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-mono text-xs font-bold">.xls</code>) and CSV rosters with non-blocking batch execution, zero fabricated statistics, and one-click rollback security.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Download size={14} /> Download Verified Roster Template (.csv)
            </button>

            <button
              onClick={handleLoadGenuineSample}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles size={14} className="text-amber-500" /> Load Genuine {currentCatObj.title} Roster
            </button>

            {onNavigateToClaim && (
              <button
                onClick={onNavigateToClaim}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold transition-all"
              >
                <HeartHandshake size={14} /> Player Claim Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 1: Grassroots Categories */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">1</span>
              Select Grassroots Division
            </h2>
            <p className="text-xs text-slate-500">Choose the cricket category to tailor column mapping, verification rules, and digital passports.</p>
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
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-3">{cat.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cat.subtitle}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cat.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">e.g. {cat.targetLeagues}</span>
                  {isSelected && <Check size={15} className="text-emerald-600 stroke-[3]" />}
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">2</span>
              Roster Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Team / Club Name (Default)</label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. Shirwal Village XI, Persistent IT Cup"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Uploaded By (Manager / Scorer)</label>
                <input
                  type="text"
                  value={managerNameInput}
                  onChange={(e) => setManagerNameInput(e.target.value)}
                  placeholder="e.g. Rajesh Bhatti (Team Captain)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
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
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-white text-center cursor-pointer transition-all group"
                >
                  <FileSpreadsheet className="mx-auto text-slate-400 group-hover:text-emerald-600 transition-colors" size={32} />
                  <p className="text-xs font-bold text-slate-800 mt-2">
                    {uploadedFile ? uploadedFile.name : 'Choose Excel or CSV Roster'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports .xlsx, .xls, .csv, .json</p>
                </div>
              </div>

              {/* Strict Real Data Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <Info size={13} /> Real Data Strict Enforcement
                </div>
                <p>
                  Missing runs or wickets stay <code className="text-slate-800 font-mono">undefined</code>. Fan Club never fabricates statistics. All profiles enter with <strong>verified provenance</strong>.
                </p>
              </div>

              {/* Start Ingestion Button */}
              <button
                onClick={handleStartImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-md shadow-emerald-600/20 active:scale-95"
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
          {/* Progress Tracker Card */}
          {progress && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw size={14} className={isProcessing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
                  {progress.currentStage}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">{progress.percentComplete}%</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">New Added</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">{progress.addedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Updated</div>
                  <div className="text-sm font-black text-sky-700 mt-0.5">{progress.updatedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Duplicates</div>
                  <div className="text-sm font-black text-amber-700 mt-0.5">{progress.duplicateCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Processed</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{progress.processedRows}/{progress.totalRows}</div>
                </div>
              </div>

              {completedBatchId && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Batch {completedBatchId} Persisted
                  </span>
                  <button
                    onClick={handleRollback}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Rollback This Batch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table Preview */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Roster Preview ({parsedRows.length} Rows)
              </h3>
              {parsedRows.length > 0 && onNavigateToPlayers && (
                <button
                  onClick={onNavigateToPlayers}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  View Database Directory <ChevronRight size={12} />
                </button>
              )}
            </div>

            {parsedRows.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Upload a team roster file (.xlsx, .csv) or click "Load Genuine Roster" above to inspect data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Player Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3 text-right">Matches</th>
                      <th className="py-2.5 px-3 text-right">Runs</th>
                      <th className="py-2.5 px-3 text-right">Wkts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.name || row.player_name || '-'}</td>
                        <td className="py-2.5 px-3 capitalize text-slate-600">{row.playing_role || row.role || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.city || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.team_name || row.team || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{row.matches || 0}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">{row.runs || 0}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sky-700 font-bold">{row.wickets || 0}</td>
                      </tr>
                    ))}
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
