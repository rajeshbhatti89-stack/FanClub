// ============================================================
// FAN CLUB — Export Service (CSV, JSON, Scorecards)
// ============================================================
import type { Player, Match, Tournament } from '../types/cricket';

export class ExportService {
  public exportPlayersToCsv(players: Player[]): string {
    const headers = ['FanClub ID', 'Name', 'Role', 'Country', 'City', 'Matches', 'Runs', 'Highest Score', 'Average', 'Strike Rate', '100s', '50s', 'Wickets', 'Economy', 'Best Bowling'];
    const rows = players.map(p => [
      p.fanClubId,
      `"${p.name}"`,
      p.role,
      `"${p.country}"`,
      `"${p.city || ''}"`,
      p.overallStats.matches,
      p.overallStats.runs,
      p.overallStats.highestScore,
      p.overallStats.battingAverage,
      p.overallStats.strikeRate,
      p.overallStats.hundreds,
      p.overallStats.fifties,
      p.overallStats.wickets,
      p.overallStats.bowlingEconomy,
      `"${p.overallStats.bestBowling}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public downloadFile(filename: string, content: string, contentType = 'text/csv') {
    const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
