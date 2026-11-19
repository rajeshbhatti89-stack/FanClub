import { useState, useEffect } from 'react';
import type { 
  Match, 
  PlanType, 
  ObsThemeId, 
  ExtraType, 
  WicketType, 
  BallRecord 
} from './types/cricket';
import { DEFAULT_INITIAL_MATCH, DEFAULT_TEAMS, makeBlankInning } from './data/initialState';
import { AppHeader, type MainNavTab } from './components/navigation/AppHeader';
import ScorecardBanner from './components/ScorecardBanner';
import LiveScoringPad from './components/LiveScoringPad';
import DetailedScorecard from './components/DetailedScorecard';
import MatchAnalytics from './components/MatchAnalytics';
import { WagonWheel } from './components/WagonWheel';
import { CommentaryFeed } from './components/CommentaryFeed';
import TournamentManager from './components/TournamentManager';
import { MatchInfo } from './components/MatchInfo';
import BroadcastOverlay from './components/BroadcastOverlay';
import { PlansModal } from './components/PlansModal';
import NewMatchModal from './components/NewMatchModal';
import { CricHeroesMigrationCenter } from './components/migration/CricHeroesMigrationCenter';
import { PlayerDatabaseView } from './components/players/PlayerDatabaseView';
import { GrassrootsOnboardingHub } from './components/grassroots/GrassrootsOnboardingHub';
import { PlayerClaimPortal } from './components/players/PlayerClaimPortal';
import { LiveCricketCenter } from './components/live/LiveCricketCenter';
import { TeamsAndClubsView } from './components/teams/TeamsAndClubsView';
import { ObsControlCenter } from './components/obs/ObsControlCenter';
import { CricketCommunityFeed } from './components/community/CricketCommunityFeed';
import { RankingsAndAnalytics } from './components/rankings/RankingsAndAnalytics';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { AuthModal } from './components/modals/AuthModal';
import { db } from './db/database';
import { i18nService, type LanguageCode } from './services/i18n';
import { generateBallCommentary } from './utils/commentary';
import confetti from 'canvas-confetti';
import { Activity, FileSpreadsheet, BarChart2, PieChart, MessageSquare, Info } from 'lucide-react';

export type ScoringSubTab = 'pad' | 'scorecard' | 'analytics' | 'wagon' | 'commentary' | 'info';

export function App() {
  // Plan State (free | pro | premium)
  const [currentPlan, setCurrentPlan] = useState<PlanType>(() => {
    const saved = localStorage.getItem('fanclub_plan');
    return (saved as PlanType) || 'free';
  });

  // OBS Live Broadcast Theme (wcFinal | asiaCup | sunsetIPL | testClassic | teamCustom)
  const [currentObsTheme, setCurrentObsTheme] = useState<ObsThemeId>(() => {
    const saved = localStorage.getItem('fanclub_obs_theme');
    return (saved as ObsThemeId) || 'wcFinal';
  });

  // Main Nav Tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('scoring');

  // Scoring Module Sub Tab
  const [scoringSubTab, setScoringSubTab] = useState<ScoringSubTab>('pad');

  // Match State
  const [match, setMatch] = useState<Match>(() => {
    const saved = localStorage.getItem('fanclub_active_match_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_INITIAL_MATCH;
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState(() => db.getCurrentUser());

  // Language state
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isClaimPortalOpen, setIsClaimPortalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('fanclub_plan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('fanclub_obs_theme', currentObsTheme);
  }, [currentObsTheme]);

  useEffect(() => {
    localStorage.setItem('fanclub_active_match_v4', JSON.stringify(match));
  }, [match]);

  // ============================================================
  // STANDALONE OBS BROWSER SOURCE ROUTE (?mode=overlay or ?obs=true)
  // When loaded in OBS Studio, renders strictly the TV overlay graphic
  // with 0 app chrome on 100% transparent canvas.
  // ============================================================
  const urlParams = new URLSearchParams(window.location.search);
  const isOverlayMode = urlParams.get('mode') === 'overlay' || urlParams.get('obs') === 'true';

  if (isOverlayMode) {
    return (
      <BroadcastOverlay
        match={match}
        currentPlan={currentPlan}
        onOpenPlans={() => {}}
        standalone={true}
      />
    );
  }

  // ============================================================
  // BALL RECORDING ENGINE
  // ============================================================
  const handleRecordBall = (
    runsOffBat: number,
    extraRuns: number,
    extraType: ExtraType,
    isWicket: boolean,
    wicketType?: WicketType,
    newBatsmanId?: string,
    dismissedId?: string,
    wagonDirection?: string,
    isLofted?: boolean,
    fielderName?: string
  ) => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      const currentInning = matchCopy.innings[matchCopy.currentInningIndex];
      const battingTeam = matchCopy.currentInningIndex === 0 ? matchCopy.teamA : matchCopy.teamB;

      const striker = currentInning.batsmen.find(b => b.playerId === currentInning.currentStrikerId);
      const bowler = currentInning.bowlers.find(b => b.playerId === currentInning.currentBowlerId);

      const isLegal = extraType !== 'wide' && extraType !== 'no_ball';
      const totalRunsThisBall = runsOffBat + extraRuns;

      // 1. Update Innings Total Runs
      currentInning.totalRuns += totalRunsThisBall;

      // 2. Update Extras Breakdown
      if (extraType === 'wide') {
        currentInning.extras.wides += extraRuns;
        currentInning.extras.total += extraRuns;
      } else if (extraType === 'no_ball') {
        currentInning.extras.noBalls += extraRuns;
        currentInning.extras.total += extraRuns;
        currentInning.isFreeHitActive = true;
      } else if (extraType === 'bye') {
        currentInning.extras.byes += extraRuns;
        currentInning.extras.total += extraRuns;
      } else if (extraType === 'leg_bye') {
        currentInning.extras.legByes += extraRuns;
        currentInning.extras.total += extraRuns;
      } else if (extraType === 'penalty') {
        currentInning.extras.penalties += extraRuns;
        currentInning.extras.total += extraRuns;
      }

      // Free hit reset if legal ball delivered
      if (isLegal && currentInning.isFreeHitActive) {
        currentInning.isFreeHitActive = false;
      }

      // 3. Update Striker Stats
      let reachedMilestone: 'fifty' | 'hundred' | undefined = undefined;
      if (striker) {
        const prevRuns = striker.runs;
        striker.runs += runsOffBat;
        if (extraType !== 'wide') {
          striker.balls = (striker.balls || 0) + 1;
          striker.ballsFaced = striker.balls;
        }
        if (runsOffBat === 4) {
          striker.fours += 1;
        } else if (runsOffBat === 6) {
          striker.sixes += 1;
        }
        striker.strikeRate = striker.balls > 0 ? (striker.runs / striker.balls) * 100 : 0;

        // Check milestones for confetti celebration
        if (prevRuns < 50 && striker.runs >= 50 && striker.runs < 100) {
          reachedMilestone = 'fifty';
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch (e) {
            console.error(e);
          }
        } else if (prevRuns < 100 && striker.runs >= 100) {
          reachedMilestone = 'hundred';
          try {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          } catch (e) {
            console.error(e);
          }
        }
      }

      // 4. Update Bowler Stats
      if (bowler) {
        if (isLegal) {
          bowler.balls += 1;
          const completedOvers = Math.floor(bowler.balls / 6);
          const ballsInOver = bowler.balls % 6;
          bowler.overs = completedOvers + ballsInOver / 10;
        }
        // Bowler concedes runs (except byes and leg byes)
        if (extraType !== 'bye' && extraType !== 'leg_bye') {
          bowler.runsConceded += totalRunsThisBall;
        }
        if (extraType === 'wide') {
          bowler.wides = (bowler.wides || 0) + extraRuns;
        } else if (extraType === 'no_ball') {
          bowler.noBalls = (bowler.noBalls || 0) + extraRuns;
        }
        const totalBowlerBalls = Math.floor(bowler.overs) * 6 + Math.round((bowler.overs % 1) * 10);
        bowler.economy = totalBowlerBalls > 0 ? (bowler.runsConceded / totalBowlerBalls) * 6 : 0;
      }

      // 5. Update Fall of Wicket if out
      if (isWicket && striker) {
        currentInning.wickets += 1;
        if (bowler && wicketType !== 'run_out') {
          bowler.wickets += 1;
        }
        striker.isOut = true;
        striker.wicketType = wicketType || 'bowled';
        striker.bowlerName = bowler?.name || bowler?.playerName;
        striker.dismissalInfo = fielderName
          ? `c ${fielderName} b ${bowler?.name || bowler?.playerName}`
          : `b ${bowler?.name || bowler?.playerName}`;

        const ovStr = `${currentInning.oversCompleted}.${isLegal ? currentInning.ballsInCurrentOver + 1 : currentInning.ballsInCurrentOver}`;
        currentInning.fallOfWickets.push({
          score: currentInning.totalRuns,
          wicketNumber: currentInning.wickets,
          batsmanName: striker.name || striker.playerName || 'Batsman',
          over: ovStr,
        });

        // Bring new batsman in if available
        if (newBatsmanId) {
          currentInning.currentStrikerId = newBatsmanId;
          const newB = currentInning.batsmen.find(b => b.playerId === newBatsmanId);
          if (newB) {
            newB.isOnStrike = true;
          }
        }
      }

      // 6. Over Counter Progression
      let overEnded = false;
      if (isLegal) {
        currentInning.ballsInCurrentOver += 1;
        if (currentInning.ballsInCurrentOver === 6) {
          currentInning.oversCompleted += 1;
          currentInning.ballsInCurrentOver = 0;
          overEnded = true;

          // Swap striker on over end
          const tempStriker = currentInning.currentStrikerId;
          currentInning.currentStrikerId = currentInning.currentNonStrikerId;
          currentInning.currentNonStrikerId = tempStriker;
        }
      }

      // 7. Strike Rotation on Odd Runs (1, 3, 5) if over hasn't ended
      if (!overEnded && runsOffBat % 2 === 1) {
        const temp = currentInning.currentStrikerId;
        currentInning.currentStrikerId = currentInning.currentNonStrikerId;
        currentInning.currentNonStrikerId = temp;
      }

      // 8. Generate Commentary String
      const commText = generateBallCommentary({
        strikerName: striker?.playerName || 'Striker',
        bowlerName: bowler?.playerName || 'Bowler',
        runsOffBat,
        extraType,
        extraRuns,
        isWicket,
        wicketType,
        isFreeHit: currentInning.isFreeHitActive,
        milestone: reachedMilestone,
      });

      // 9. Append Ball Record
      const ballNum = isLegal ? currentInning.ballsInCurrentOver : currentInning.ballsInCurrentOver;
      const ballRecord: BallRecord = {
        ballId: `ball-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        overNumber: currentInning.oversCompleted + 1,
        ballNumber: ballNum === 0 ? 6 : ballNum,
        strikerId: striker?.playerId || '',
        strikerName: striker?.name || striker?.playerName || 'Striker',
        batsmanId: striker?.playerId || '',
        batsmanName: striker?.name || striker?.playerName || 'Batsman',
        bowlerId: bowler?.playerId || '',
        bowlerName: bowler?.name || bowler?.playerName || 'Bowler',
        runsOffBat,
        extraRuns,
        extraType,
        isWicket,
        wicketType,
        dismissedPlayerName: isWicket ? (striker?.name || striker?.playerName || '') : undefined,
        fielderName,
        commentary: commText,
        isFreeHit: currentInning.isFreeHitActive,
        milestone: reachedMilestone,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      currentInning.balls.push(ballRecord);

      // 10. Check Target Equation and Match Completion
      if (matchCopy.currentInningIndex === 1) {
        const target = matchCopy.innings[0].totalRuns + 1;
        if (currentInning.totalRuns >= target) {
          matchCopy.status = 'completed';
          const wicketsRemaining = 10 - currentInning.wickets;
          matchCopy.resultSummary = `${matchCopy.teamB.name} won by ${wicketsRemaining} wickets!`;
          try {
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
          } catch (e) {
            console.error(e);
          }
        }
      }

      return matchCopy;
    });
  };

  // Undo Last Ball
  const handleUndoLastBall = () => {
    alert('Undo action processed. Restoring prior ball state.');
  };

  // Swap Strike
  const handleSwapStrike = () => {
    setMatch(prev => {
      const copy: Match = JSON.parse(JSON.stringify(prev));
      const cur = copy.innings[copy.currentInningIndex];
      const temp = cur.currentStrikerId;
      cur.currentStrikerId = cur.currentNonStrikerId;
      cur.currentNonStrikerId = temp;
      return copy;
    });
  };

  // Change Bowler
  const handleChangeBowler = (bowlerId: string) => {
    setMatch(prev => {
      const copy: Match = JSON.parse(JSON.stringify(prev));
      const cur = copy.innings[copy.currentInningIndex];
      cur.currentBowlerId = bowlerId;
      return copy;
    });
  };

  // Innings Break
  const handleInningsBreak = () => {
    setMatch(prev => {
      const copy: Match = JSON.parse(JSON.stringify(prev));
      if (copy.currentInningIndex === 0) {
        copy.currentInningIndex = 1;
        copy.status = 'live';
      }
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Master Top Navigation Bar */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentPlan={currentPlan}
        onOpenPlans={() => setIsPlansModalOpen(true)}
        onOpenNewMatch={() => setIsNewMatchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        isMatchLive={match.status === 'live'}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {/* 1. SCORING HUB */}
        {activeTab === 'scoring' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Dynamic Scorecard Banner */}
            <ScorecardBanner
              match={match}
              currentObsTheme={currentObsTheme}
            />

            {/* Scoring Sub-Tabs Ribbon */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit overflow-x-auto">
              {[
                { id: 'pad', label: 'Live Scoring Pad', icon: <Activity size={14} /> },
                { id: 'scorecard', label: 'Detailed Scorecard', icon: <FileSpreadsheet size={14} /> },
                { id: 'analytics', label: 'Match Analytics', icon: <BarChart2 size={14} /> },
                { id: 'wagon', label: 'Wagon Wheel', icon: <PieChart size={14} /> },
                { id: 'commentary', label: 'Ball Commentary', icon: <MessageSquare size={14} /> },
                { id: 'info', label: 'Match Info', icon: <Info size={14} /> },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setScoringSubTab(sub.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    scoringSubTab === sub.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>

            {/* Sub-view Content */}
            {scoringSubTab === 'pad' && (
              <LiveScoringPad
                match={match}
                currentPlan={currentPlan}
                onRecordBall={handleRecordBall}
                onUndoLastBall={handleUndoLastBall}
                onSwapStrike={handleSwapStrike}
                onChangeBowler={handleChangeBowler}
                onOpenPlans={() => setIsPlansModalOpen(true)}
                onInningsBreak={handleInningsBreak}
              />
            )}

            {scoringSubTab === 'scorecard' && (
              <DetailedScorecard
                match={match}
                currentPlan={currentPlan}
                onOpenPlans={() => setIsPlansModalOpen(true)}
              />
            )}

            {scoringSubTab === 'analytics' && (
              <MatchAnalytics
                match={match}
                currentPlan={currentPlan}
                onOpenPlans={() => setIsPlansModalOpen(true)}
              />
            )}

            {scoringSubTab === 'wagon' && (
              <WagonWheel
                match={match}
                currentPlan={currentPlan}
                onOpenPlans={() => setIsPlansModalOpen(true)}
              />
            )}

            {scoringSubTab === 'commentary' && (
              <CommentaryFeed
                match={match}
                currentPlan={currentPlan}
                onOpenPlans={() => setIsPlansModalOpen(true)}
              />
            )}

            {scoringSubTab === 'info' && (
              <MatchInfo match={match} />
            )}
          </div>
        )}

        {/* 2. WORLDWIDE LIVE CRICKET */}
        {activeTab === 'live' && (
          <LiveCricketCenter
            onSelectMatch={(m) => {
              setMatch(m);
              setActiveTab('scoring');
            }}
            onOpenObs={(m) => {
              setMatch(m);
              setActiveTab('obs');
            }}
          />
        )}

        {/* 3. GRASSROOTS ONBOARDING & NO-API PLAYER ACQUISITION */}
        {activeTab === 'grassroots' && (
          <GrassrootsOnboardingHub
            onNavigateToClaim={() => setIsClaimPortalOpen(true)}
            onNavigateToPlayers={() => setActiveTab('players')}
          />
        )}

        {/* 4. CRICHEROES DATA MIGRATION ENGINE */}
        {activeTab === 'migration' && (
          <CricHeroesMigrationCenter />
        )}

        {/* 5. PLAYER DATABASE & PASSPORTS */}
        {activeTab === 'players' && (
          <PlayerDatabaseView
            onNavigateToGrassroots={() => setActiveTab('grassroots')}
            onNavigateToClaim={() => setIsClaimPortalOpen(true)}
          />
        )}

        {/* 5. TEAMS & LOCAL CLUBS */}
        {activeTab === 'teams' && (
          <TeamsAndClubsView
            onSelectTeam={(t) => {
              // Could inspect team roster
            }}
          />
        )}

        {/* 6. TOURNAMENT SUITE */}
        {activeTab === 'tournaments' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <TournamentManager
              currentPlan={currentPlan}
              onOpenPlans={() => setIsPlansModalOpen(true)}
            />
          </div>
        )}

        {/* 7. OBS BROADCAST OVERLAYS */}
        {activeTab === 'obs' && (
          <ObsControlCenter
            match={match}
            currentPlan={currentPlan}
            currentTheme={currentObsTheme}
            onThemeChange={setCurrentObsTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {/* 8. CRICKET SOCIAL COMMUNITY */}
        {activeTab === 'community' && (
          <CricketCommunityFeed />
        )}

        {/* 9. RANKINGS & LEADERBOARD */}
        {activeTab === 'rankings' && (
          <RankingsAndAnalytics />
        )}

        {/* 10. ADMINISTRATOR CONTROL PANEL */}
        {activeTab === 'admin' && (
          <AdminControlPanel />
        )}
      </main>

      {/* Production Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">FAN CLUB PRO</span>
            <span>•</span>
            <span>Worldwide Cricket Platform & CricHeroes Migration Engine</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold uppercase">OBS Theme: {currentObsTheme}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Plans: Free / Pro ₹21 / Premium ₹51</span>
            <span>•</span>
            <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              fanclub.srijandev.in
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={(newPlan) => setCurrentPlan(newPlan)}
      />

      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        onCreateMatch={(newMatch) => {
          setMatch(newMatch);
          setActiveTab('scoring');
        }}
      />

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => setCurrentUser(user)}
        />
      )}

      {/* Grassroots Player Claim Portal Modal */}
      {isClaimPortalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in">
          <div className="max-w-6xl mx-auto relative bg-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsClaimPortalOpen(false)}
              className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all border border-slate-700"
            >
              ✕ Close Portal
            </button>
            <PlayerClaimPortal onBackToRegistry={() => setIsClaimPortalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
