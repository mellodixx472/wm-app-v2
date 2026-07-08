import type { Match } from "../types";

export interface TeamRow {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

function emptyRow(team: string): TeamRow {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };
}

/**
 * Berechnet die Tabellen aller Gruppen aus den Gruppenspielen.
 * Sortierung: Punkte, Tordifferenz, erzielte Tore, Name.
 */
export function computeStandings(matches: Match[]): Map<string, TeamRow[]> {
  const groups = new Map<string, Map<string, TeamRow>>();

  for (const match of matches) {
    if (!match.group) continue;
    let table = groups.get(match.group);
    if (!table) {
      table = new Map();
      groups.set(match.group, table);
    }
    for (const team of [match.team1, match.team2]) {
      if (!table.has(team)) table.set(team, emptyRow(team));
    }
    if (!match.score) continue;

    const [g1, g2] = match.score.ft;
    const row1 = table.get(match.team1)!;
    const row2 = table.get(match.team2)!;
    row1.played++;
    row2.played++;
    row1.goalsFor += g1;
    row1.goalsAgainst += g2;
    row2.goalsFor += g2;
    row2.goalsAgainst += g1;
    if (g1 > g2) {
      row1.won++;
      row2.lost++;
      row1.points += 3;
    } else if (g1 < g2) {
      row2.won++;
      row1.lost++;
      row2.points += 3;
    } else {
      row1.drawn++;
      row2.drawn++;
      row1.points++;
      row2.points++;
    }
  }

  const result = new Map<string, TeamRow[]>();
  for (const [group, table] of [...groups.entries()].sort()) {
    const rows = [...table.values()];
    for (const row of rows) row.goalDiff = row.goalsFor - row.goalsAgainst;
    rows.sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.team.localeCompare(b.team),
    );
    result.set(group, rows);
  }
  return result;
}
