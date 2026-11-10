import { useState, useEffect } from 'react';
import type { 
  Match, 
  PlanType, 
  ThemeId, 
  ExtraType, 
  WicketType, 
  BallRecord 
} from './types/cricket';
import { INITIAL_MATCH } from './data/mockData';
import { Header } from './components/Header';
import { ScorecardBanner } from './components/ScorecardBanner';
import { LiveScoringPad } from './components/LiveScoringPad';
import { DetailedScorecard } from './components/DetailedScorecard';
import { CommentaryFeed } from './components/CommentaryFeed';
import { WagonWheel } from './components/WagonWheel';
import { TournamentTable } from './components/TournamentTable';
import { BroadcastOverlay } from './components/BroadcastOverlay';
import { PlansModal } from './components/PlansModal';
import { NewMatchModal } from './components/NewMatchModal';
import { generateBallCommentary } from './utils/commentaryGenerator';
import confetti from 'canvas-confetti';

export function App() {
  // Plan State (free | pro | premium)
  const [currentPlan, setCurrentPlan] = useState<PlanType>(() => {
    const saved = localStorage.getItem('fanclub_plan');
    return (saved as PlanType) || 'free';
  });

  // Theme State (wcFinal | asiaCup | cricHeroes | sunsetIPL | teamCustom)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('fanclub_theme');
    return (saved as ThemeId) || 'wcFinal';
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<
    'scoring' | 'scorecard' | 'commentary' | 'wagon' | 'tournament' | 'broadcast'
  >('scoring');

  // Match State
  const [match, setMatch] = useState<Match>(() => {
    const saved = localStorage.getItem('fanclub_match_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MATCH;
  });

  // Modals
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('fanclub_plan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('fanclub_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('fanclub_match_v2', JSON.stringify(match));
  }, [match]);

  // Handle Recording a Ball
  const handleRecordBall = (
    runsOffBat: number,
    extraRuns: number,
    extraType: ExtraType,
    isWicket: boolean,
    wicketType?: WicketType,
    newBatsmanId?: string,
    _dismissedId?: string,
    wagonDirection?: string
  ) => {
    setMatch(prevMatch => {
      const matchCopy: Match = JSON.parse(JSON.stringify(prevMatch));
      const currentInning = matchCopy.innings[matchCopy.currentInningIndex];
      const battingTeam = matchCopy.currentInningIndex === 0 ? matchCopy.teamA : matchCopy.teamB;

      const striker = currentInning.batsmen.find(b => b.playerId === currentInning.currentStrikerId);
      const bowler = currentInning.bowlers.find(b => b.playerId === currentInning.currentBowlerId);

      const isLegal = extraType !== 'wide' && extraType !== 'no_ball';
      const totalRunsThisBall = runsOffBat + extraRuns;

      // 1. Update Innings Total
      currentInning.totalRuns += totalRunsThisBall;

      // 2. Update Extras Breakdown
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
      }

      // 3. Update Striker Stats
      if (striker) {
        if (extraType !== 'wide') {
          striker.balls += 1;
        }
        striker.runs += runsOffBat;
        if (runsOffBat === 4) striker.fours += 1;
        if (runsOffBat === 6) striker.sixes += 1;
        striker.strikeRate = striker.balls > 0 ? (striker.runs / striker.balls) * 100 : 0;

        if (wagonDirection && runsOffBat > 0) {
          if (!striker.wagonShots) striker.wagonShots = [];
          striker.wagonShots.push({ direction: wagonDirection, runs: runsOffBat });
        }
      }

      // 4. Update Bowler Stats
      if (bowler) {
        if (extraType !== 'bye' && extraType !== 'leg_bye') {
          bowler.runsConceded += totalRunsThisBall;
        }
        if (extraType === 'wide') bowler.wides += 1;
        if (extraType === 'no_ball') bowler.noBalls += 1;
        if (runsOffBat === 0 && totalRunsThisBall === 0 && isLegal) {
          bowler.dots += 1;
        }
        if (isWicket && wicketType !== 'run_out' && wicketType !== 'timed_out') {
          bowler.wickets += 1;
        }
      }

      // 5. Handle Wickets
      if (isWicket) {
        currentInning.wickets += 1;
        if (striker) {
          striker.isOut = true;
          striker.dismissal = `${wicketType || 'out'} b ${bowler?.name || 'Bowler'}`;
        }

        // Insert new batsman if selected
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
            });
            currentInning.currentStrikerId = newPlayer.id;
          }
        }
      }

      // 6. Generate Realistic Ball Commentary
      const commentary = generateBallCommentary(
        bowler?.name || 'Bowler',
        striker?.name || 'Batsman',
        runsOffBat,
        isWicket,
        wicketType,
        extraType,
        wagonDirection
      );

      // 7. Add Ball to History
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
        commentary,
        timestamp: Date.now()
      };
      currentInning.balls.push(ballLog);

      // 8. Update Legal Ball / Over Counters & Strike Rotation
      if (isLegal) {
        currentInning.ballsInCurrentOver += 1;

        // Strike rotates on odd runs
        if (runsOffBat % 2 !== 0) {
          const temp = currentInning.currentStrikerId;
          currentInning.currentStrikerId = currentInning.currentNonStrikerId;
          currentInning.currentNonStrikerId = temp;
        }

        // Check if Over Completed (6 legal balls)
        if (currentInning.ballsInCurrentOver >= 6) {
          currentInning.oversCompleted += 1;
          currentInning.ballsInCurrentOver = 0;

          if (bowler) {
            bowler.overs += 1;
            bowler.economy = bowler.overs > 0 ? bowler.runsConceded / bowler.overs : 0;
          }

          // Strike switches at end of over
          const temp = currentInning.currentStrikerId;
          currentInning.currentStrikerId = currentInning.currentNonStrikerId;
          currentInning.currentNonStrikerId = temp;
        }
      }

      // Check Win Condition or Innings Finish
      if (matchCopy.currentInningIndex === 1) {
        const target = matchCopy.innings[0].totalRuns + 1;
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
      if (currentInning.balls.length === 0) return prevMatch;

      const lastBall = currentInning.balls.pop();
      if (!lastBall) return prevMatch;

      // Revert totals
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
      }

      // Revert striker stats
      const striker = currentInning.batsmen.find(b => b.playerId === lastBall.strikerId);
      if (striker) {
        if (lastBall.extraType !== 'wide') {
          striker.balls = Math.max(0, striker.balls - 1);
        }
        striker.runs = Math.max(0, striker.runs - lastBall.runsOffBat);
        if (lastBall.runsOffBat === 4) striker.fours = Math.max(0, striker.fours - 1);
        if (lastBall.runsOffBat === 6) striker.sixes = Math.max(0, striker.sixes - 1);
        striker.strikeRate = striker.balls > 0 ? (striker.runs / striker.balls) * 100 : 0;
        if (lastBall.isWicket) {
          striker.isOut = false;
          delete striker.dismissal;
        }
      }

      // Revert bowler stats
      const bowler = currentInning.bowlers.find(b => b.playerId === lastBall.bowlerId);
      if (bowler) {
        if (lastBall.extraType !== 'bye' && lastBall.extraType !== 'leg_bye') {
          bowler.runsConceded = Math.max(0, bowler.runsConceded - (lastBall.runsOffBat + lastBall.extraRuns));
        }
        if (lastBall.isWicket && lastBall.wicketType !== 'run_out') {
          bowler.wickets = Math.max(0, bowler.wickets - 1);
        }
      }

      return matchCopy;
    });
  };

  // Swap Strike
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

  // Change Bowler
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
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economy: 0,
            wides: 0,
            noBalls: 0,
            dots: 0
          };
          currentInning.bowlers.push(bowler);
        }
      }
      currentInning.currentBowlerId = bowlerId;
      return matchCopy;
    });
  };

  // Reset Demo to World Cup Final Match
  const handleResetDemo = () => {
    if (confirm('Reset to standard World Cup Grand Final demo match?')) {
      setMatch(INITIAL_MATCH);
      setCurrentTheme('wcFinal');
      localStorage.removeItem('fanclub_match_v2');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Global App Header */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        currentPlan={currentPlan}
        onOpenPlans={() => setIsPlansModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewMatch={() => setIsNewMatchModalOpen(true)}
        onResetDemo={handleResetDemo}
        teamAColor={match.teamA.color}
        teamBColor={match.teamB.color}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Dynamic Match Scorecard Banner */}
        <ScorecardBanner
          match={match}
          currentTheme={currentTheme}
        />

        {/* Tab View Routing */}
        {activeTab === 'scoring' && (
          <LiveScoringPad
            match={match}
            currentTheme={currentTheme}
            currentPlan={currentPlan}
            onRecordBall={handleRecordBall}
            onUndoLastBall={handleUndoLastBall}
            onSwapStrike={handleSwapStrike}
            onChangeBowler={handleChangeBowler}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'scorecard' && (
          <DetailedScorecard
            match={match}
            currentPlan={currentPlan}
            currentTheme={currentTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'commentary' && (
          <CommentaryFeed
            match={match}
            currentPlan={currentPlan}
            currentTheme={currentTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'wagon' && (
          <WagonWheel
            match={match}
            currentPlan={currentPlan}
            currentTheme={currentTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'tournament' && (
          <TournamentTable
            currentPlan={currentPlan}
            currentTheme={currentTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'broadcast' && (
          <BroadcastOverlay
            match={match}
            currentPlan={currentPlan}
            currentTheme={currentTheme}
            onOpenPlans={() => setIsPlansModalOpen(true)}
          />
        )}
      </main>

      {/* Cloudflare Pages Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FanClub Cricket Scoring</span>
            <span>•</span>
            <span>Based on CricHeroes</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Active: {currentTheme.toUpperCase()}</span>
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
