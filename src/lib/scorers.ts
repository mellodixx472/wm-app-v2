import type { Match } from "../types";

export interface ScorerRow {
  name: string;
  team: string;
  goals: number;
  penalties: number;
}

/**
 * Torschützenliste über alle Spiele. Eigentore zählen nicht,
 * Elfmeter zählen und werden separat ausgewiesen.
 * Sortierung: Tore, weniger Elfmeter, Name.
 */
export function computeScorers(matches: Match[]): ScorerRow[] {
  const scorers = new Map<string, ScorerRow>();

  for (const match of matches) {
    const sides: Array<[typeof match.goals1, string]> = [
      [match.goals1, match.team1],
      [match.goals2, match.team2],
    ];
    for (const [goals, team] of sides) {
      for (const goal of goals ?? []) {
        if (goal.owngoal) continue;
        const key = `${goal.name}|${team}`;
        let row = scorers.get(key);
        if (!row) {
          row = { name: goal.name, team, goals: 0, penalties: 0 };
          scorers.set(key, row);
        }
        row.goals++;
        if (goal.penalty) row.penalties++;
      }
    }
  }

  return [...scorers.values()].sort(
    (a, b) =>
      b.goals - a.goals ||
      a.penalties - b.penalties ||
      a.name.localeCompare(b.name),
  );
}
