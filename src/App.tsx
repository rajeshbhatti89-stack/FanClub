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
import Header, { type ActiveTabType } from './components/Header';
import ScorecardBanner from './components/ScorecardBanner';
import LiveScoringPad from './components/LiveScoringPad';
import DetailedScorecard from './components/DetailedScorecard';
import MatchAnalytics from './components/MatchAnalytics';
import { WagonWheel } from './components/WagonWheel';
import { CommentaryFeed } from './components/CommentaryFeed';
import TournamentManager from './components/TournamentManager';
import TeamsManager from './components/TeamsManager';
import { MatchInfo } from './components/MatchInfo';
import BroadcastOverlay from './components/BroadcastOverlay';
import { PlansModal } from './components/PlansModal';
import NewMatchModal from './components/NewMatchModal';
import { generateBallCommentary } from './utils/commentary';
import confetti from 'canvas-confetti';

export function App() {
  // Plan State (free | pro | premium)
  const [currentPlan, setCurrentPlan] = useState<PlanType>(() => {
    const saved = localStorage.getItem('fanclub_plan');
    return (saved as PlanType) || 'free';
  });

  // OBS Live Broadcast Theme (wcFinal | asiaCup | sunsetIPL | teamCustom)
  const [currentObsTheme, setCurrentObsTheme] = useState<ObsThemeId>(() => {
    const saved = localStorage.getItem('fanclub_obs_theme');
    return (saved as ObsThemeId) || 'wcFinal';
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveTabType>('scoring');

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

  // Modals
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);

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

      // 2. Free Hit Logic
      const wasFreeHit = !!currentInning.isFreeHitActive;
      if (extraType === 'no_ball') {
        currentInning.isFreeHitActive = true;
      } else if (isLegal) {
        currentInning.isFreeHitActive = false;
      }

      // 3. Update Extras Breakdown
      if (extraType === 'wide') {
        currentInning.extras.wides += extraRuns;
        currentInning.extras.total += extraRuns;
      } else if (extraType === 'no_ball') {
        currentInning.extras.noBalls += extraRuns;
        currentInning.extras.total += extraRuns;
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

      // 4. Update Striker Stats
      if (striker) {
        if (extraType !== 'wide') {
          striker.balls += 1;
        }
        striker.runs += runsOffBat;
        if (runsOffBat === 4) striker.fours += 1;
        if (runsOffBat === 6) striker.sixes += 1;
        striker.strikeRate = striker.balls > 0 ? parseFloat(((striker.runs / striker.balls) * 100).toFixed(1)) : 0;

        if (wagonDirection && runsOffBat > 0) {
          if (!striker.wagonShots) striker.wagonShots = [];
          striker.wagonShots.push({ 
            direction: wagonDirection, 
            runs: runsOffBat, 
            isLofted: !!isLofted,
            timestamp: Date.now()
          });
        }
      }

      // 5. Update Bowler Stats
      if (bowler) {
        if (extraType !== 'bye' && extraType !== 'leg_bye' && extraType !== 'penalty') {
          bowler.runsConceded += totalRunsThisBall;
        }
        if (extraType === 'wide') bowler.wides += 1;
        if (extraType === 'no_ball') bowler.noBalls += 1;
        if (runsOffBat === 4) bowler.foursConceded = (bowler.foursConceded || 0) + 1;
        if (runsOffBat === 6) bowler.sixesConceded = (bowler.sixesConceded || 0) + 1;
        if (runsOffBat === 0 && totalRunsThisBall === 0 && isLegal) {
          bowler.dots += 1;
        }
        if (isWicket && wicketType !== 'run_out' && wicketType !== 'timed_out' && wicketType !== 'retired_hurt') {
          bowler.wickets += 1;
        }
      }

      // 6. Handle Wickets
      if (isWicket) {
        currentInning.wickets += 1;
        const targetBatter = currentInning.batsmen.find(b => b.playerId === dismissedId) || striker;

        if (targetBatter) {
          targetBatter.isOut = true;
          let dismissalStr = wicketType ? wicketType.replace(/_/g, ' ') : 'out';
          if (fielderName && (wicketType === 'caught' || wicketType === 'run_out')) {
            dismissalStr += ` (${fielderName})`;
          }
          if (wicketType !== 'run_out' && bowler) {
            dismissalStr += ` b ${bowler.name}`;
          }
          targetBatter.dismissal = dismissalStr;
          targetBatter.dismissalType = wicketType;
        }

        // Add to Fall of Wickets (FOW)
        if (!currentInning.fallOfWickets) currentInning.fallOfWickets = [];
        currentInning.fallOfWickets.push({
          wicketNumber: currentInning.wickets,
          score: currentInning.totalRuns,
          overs: `${currentInning.oversCompleted}.${currentInning.ballsInCurrentOver + (isLegal ? 1 : 0)}`,
          batsmanName: targetBatter ? targetBatter.name : 'Batter',
          batsmanId: targetBatter ? targetBatter.playerId : '',
          dismissal: targetBatter?.dismissal || 'Wicket'
        });

        // Insert new incoming batsman
        if (newBatsmanId) {
          const newPlayer = battingTeam.players.find(p => p.id === newBatsmanId);
          if (newPlayer) {
            currentInning.batsmen.push({
              playerId: newPlayer.id,
              name: newPlayer.name,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              isOut: false,
              wagonShots: [],
              milestones: []
            });
            if (targetBatter?.playerId === currentInning.currentNonStrikerId) {
              currentInning.currentNonStrikerId = newPlayer.id;
            } else {
              currentInning.currentStrikerId = newPlayer.id;
            }
          }
        }
      }

      // 7. Generate Ball Commentary
      const commentary = generateBallCommentary(
        bowler?.name || 'Bowler',
        striker?.name || 'Batsman',
        runsOffBat,
        isWicket,
        wicketType,
        extraType,
        wagonDirection
      );

      // 8. Add Ball to Balls History
      const ballLog: BallRecord = {
        id: `ball-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        overIndex: currentInning.oversCompleted,
        ballInOver: currentInning.ballsInCurrentOver + (isLegal ? 1 : 0),
        bowlerId: bowler?.playerId || '',
        bowlerName: bowler?.name || 'Bowler',
        strikerId: striker?.playerId || '',
        strikerName: striker?.name || 'Batsman',
        nonStrikerId: currentInning.currentNonStrikerId,
        runsOffBat,
        extraRuns,
        extraType,
        isLegalBall: isLegal,
        isWicket,
        wicketType,
        wagonDirection,
        isLofted,
        isFreeHit: wasFreeHit,
        fielderName,
        commentary,
        timestamp: Date.now()
      };
      if (!currentInning.balls) currentInning.balls = [];
      currentInning.balls.push(ballLog);

      // 9. Legal Ball / Over Counters & Strike Rotation
      if (isLegal) {
        currentInning.ballsInCurrentOver += 1;

        // Strike rotates on odd runs
        if (runsOffBat % 2 !== 0) {
          const temp = currentInning.currentStrikerId;
          currentInning.currentStrikerId = currentInning.currentNonStrikerId;
          currentInning.currentNonStrikerId = temp;
        }

        // Check Over Finished (6 legal balls)
        if (currentInning.ballsInCurrentOver >= 6) {
          currentInning.oversCompleted += 1;
          currentInning.ballsInCurrentOver = 0;

          if (bowler) {
            bowler.overs += 1;
            bowler.economy = bowler.overs > 0 ? parseFloat((bowler.runsConceded / bowler.overs).toFixed(2)) : 0;
          }

          // Strike switches at end of over
          const temp = currentInning.currentStrikerId;
          currentInning.currentStrikerId = currentInning.currentNonStrikerId;
          currentInning.currentNonStrikerId = temp;
        }
      }

      // 10. Check Win Condition in 2nd Innings
      if (matchCopy.currentInningIndex === 1) {
        const target = (matchCopy.innings[0].totalRuns || 0) + 1;
        if (currentInning.totalRuns >= target) {
          matchCopy.status = 'completed';
          matchCopy.winnerTeamId = battingTeam.id;
          matchCopy.winMargin = `${10 - currentInning.wickets} wickets`;
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
        }
      }

      return matchCopy;
    });
  };

  // Undo Last Ball
  const handleUndoLastBall = () => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      const currentInning = matchCopy.innings[matchCopy.currentInningIndex];
      if (!currentInning.balls || currentInning.balls.length === 0) return prevMatch;

      const lastBall = currentInning.balls.pop();
      if (!lastBall) return prevMatch;

      currentInning.totalRuns = Math.max(0, currentInning.totalRuns - (lastBall.runsOffBat + lastBall.extraRuns));

      if (lastBall.isLegalBall) {
        if (currentInning.ballsInCurrentOver > 0) {
          currentInning.ballsInCurrentOver -= 1;
        } else if (currentInning.oversCompleted > 0) {
          currentInning.oversCompleted -= 1;
          currentInning.ballsInCurrentOver = 5;
        }
      }

      if (lastBall.isWicket) {
        currentInning.wickets = Math.max(0, currentInning.wickets - 1);
        if (currentInning.fallOfWickets && currentInning.fallOfWickets.length > 0) {
          currentInning.fallOfWickets.pop();
        }
      }

      const striker = currentInning.batsmen.find(b => b.playerId === lastBall.strikerId);
      if (striker) {
        if (lastBall.extraType !== 'wide') {
          striker.balls = Math.max(0, striker.balls - 1);
        }
        striker.runs = Math.max(0, striker.runs - lastBall.runsOffBat);
        if (lastBall.runsOffBat === 4) striker.fours = Math.max(0, striker.fours - 1);
        if (lastBall.runsOffBat === 6) striker.sixes = Math.max(0, striker.sixes - 1);
        striker.strikeRate = striker.balls > 0 ? parseFloat(((striker.runs / striker.balls) * 100).toFixed(1)) : 0;
        if (lastBall.isWicket) {
          striker.isOut = false;
          delete striker.dismissal;
        }
      }

      const bowler = currentInning.bowlers.find(b => b.playerId === lastBall.bowlerId);
      if (bowler) {
        if (lastBall.extraType !== 'bye' && lastBall.extraType !== 'leg_bye' && lastBall.extraType !== 'penalty') {
          bowler.runsConceded = Math.max(0, bowler.runsConceded - (lastBall.runsOffBat + lastBall.extraRuns));
        }
        if (lastBall.isWicket && lastBall.wicketType !== 'run_out') {
          bowler.wickets = Math.max(0, bowler.wickets - 1);
        }
      }

      return matchCopy;
    });
  };

  const handleSwapStrike = () => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      const currentInning = matchCopy.innings[matchCopy.currentInningIndex];
      const temp = currentInning.currentStrikerId;
      currentInning.currentStrikerId = currentInning.currentNonStrikerId;
      currentInning.currentNonStrikerId = temp;
      return matchCopy;
    });
  };

  const handleChangeBowler = (bowlerId: string) => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      const currentInning = matchCopy.innings[matchCopy.currentInningIndex];
      const bowlingTeam = matchCopy.currentInningIndex === 0 ? matchCopy.teamB : matchCopy.teamA;

      let bowler = currentInning.bowlers.find(b => b.playerId === bowlerId);
      if (!bowler) {
        const player = bowlingTeam.players.find(p => p.id === bowlerId);
        if (player) {
          bowler = {
            playerId: player.id,
            name: player.name,
            overs: 0,
            balls: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economy: 0,
            wides: 0,
            noBalls: 0,
            dots: 0,
            foursConceded: 0,
            sixesConceded: 0
          };
          currentInning.bowlers.push(bowler);
        }
      }
      currentInning.currentBowlerId = bowlerId;
      return matchCopy;
    });
  };

  const handleInningsBreak = () => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      if (matchCopy.currentInningIndex === 0) {
        matchCopy.currentInningIndex = 1;
        matchCopy.innings[1].targetScore = matchCopy.innings[0].totalRuns + 1;
      }
      return matchCopy;
    });
  };

  const handleResetMatch = () => {
    if (confirm('Reset to initial World Championship Grand Final match?')) {
      setMatch(DEFAULT_INITIAL_MATCH);
      setCurrentObsTheme('wcFinal');
      localStorage.removeItem('fanclub_active_match_v4');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Global CricHeroes Style App Header */}
      <Header
        currentPlan={currentPlan}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPlans={() => setIsPlansModalOpen(true)}
        onNewMatch={() => setIsNewMatchModalOpen(true)}
        onResetMatch={handleResetMatch}
        currentObsTheme={currentObsTheme}
        onSelectObsTheme={setCurrentObsTheme}
        matchTitle={match.title}
        matchStatus={match.status}
        teamAColor={match.teamA.color}
        teamBColor={match.teamB.color}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Dynamic Match Scorecard Banner with Match Performers Ribbon */}
        <ScorecardBanner
          match={match}
          currentObsTheme={currentObsTheme}
        />

        {/* Tab Routing */}
        {activeTab === 'scoring' && (
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

        {activeTab === 'scorecard' && (
          <DetailedScorecard
            match={match}
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <MatchAnalytics
            match={match}
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'wagon' && (
          <WagonWheel
            match={match}
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'commentary' && (
          <CommentaryFeed
            match={match}
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'tournament' && (
          <TournamentManager
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsManager />
        )}

        {activeTab === 'info' && (
          <MatchInfo match={match} />
        )}

        {activeTab === 'broadcast' && (
          <BroadcastOverlay
            match={match}
            currentPlan={currentPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
            standalone={false}
          />
        )}
      </main>

      {/* Cloudflare Pages Deployment Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">FanClub</span>
            <span>•</span>
            <span>CricHeroes Live Scoring & Broadcast Engine</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold uppercase">OBS Theme: {currentObsTheme}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Plans: Free / Pro ₹21 / Premium ₹51</span>
            <span>•</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              fanclub.srijandev.in
            </span>
          </div>
        </div>
      </footer>

      {/* Plans & Pricing Modal */}
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={(newPlan) => setCurrentPlan(newPlan)}
      />

      {/* Create New Match Modal */}
      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        onCreateMatch={(newMatch) => {
          setMatch(newMatch);
          setActiveTab('scoring');
        }}
      />
    </div>
  );
}

export default App;
