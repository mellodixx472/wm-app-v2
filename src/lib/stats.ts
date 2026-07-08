import type { Goal, Match } from "../types";
import { finalScore } from "./knockout";

export interface PhaseGoals {
  phase: string;
  matches: number;
  goals: number;
  average: number;
}

export interface OwnGoalEntry {
  goal: Goal;
  match: Match;
  /** Team, dem das Eigentor zugutekam */
  benefitedTeam: string;
}

export interface VenueRow {
  venue: string;
  matches: number;
  goals: number;
}

function totalGoals(match: Match): number {
  const [g1, g2] = finalScore(match.score!);
  return g1 + g2;
}

/** Gespielte Partien mit den meisten Toren, absteigend. */
export function highestScoringMatches(matches: Match[], top: number): Match[] {
  return matches
    .filter((m) => m.score)
    .sort((a, b) => totalGoals(b) - totalGoals(a))
    .slice(0, top);
}

/** Tore und Schnitt je Turnierphase (Gruppenphase gebündelt, K.o.-Runden einzeln). */
export function goalsByPhase(matches: Match[]): PhaseGoals[] {
  const order: string[] = [];
  const acc = new Map<string, { matches: number; goals: number }>();
  for (const m of matches) {
    if (!m.score) continue;
    const phase = m.group ? "Gruppenphase" : m.round;
    if (!acc.has(phase)) {
      acc.set(phase, { matches: 0, goals: 0 });
      order.push(phase);
    }
    const entry = acc.get(phase)!;
    entry.matches++;
    entry.goals += totalGoals(m);
  }
  return order.map((phase) => {
    const { matches: count, goals } = acc.get(phase)!;
    return { phase, matches: count, goals, average: goals / count };
  });
}

/** Verwandelte Elfmeter im Spielverlauf (ohne Elfmeterschießen). */
export function penaltyGoalCount(matches: Match[]): number {
  return matches
    .flatMap((m) => [...(m.goals1 ?? []), ...(m.goals2 ?? [])])
    .filter((g) => g.penalty && !g.owngoal).length;
}

/** Alle Eigentore mit Spielkontext. */
export function ownGoals(matches: Match[]): OwnGoalEntry[] {
  const result: OwnGoalEntry[] = [];
  for (const match of matches) {
    for (const goal of match.goals1 ?? []) {
      if (goal.owngoal) result.push({ goal, match, benefitedTeam: match.team1 });
    }
    for (const goal of match.goals2 ?? []) {
      if (goal.owngoal) result.push({ goal, match, benefitedTeam: match.team2 });
    }
  }
  return result;
}

/** Spiele, die in der Verlängerung bzw. im Elfmeterschießen entschieden wurden. */
export function decidedLate(matches: Match[]): {
  extraTime: Match[];
  shootout: Match[];
} {
  const played = matches.filter((m) => m.score);
  return {
    extraTime: played.filter((m) => m.score!.et && !m.score!.p),
    shootout: played.filter((m) => m.score!.p),
  };
}

/** Spielorte nach Anzahl Spielen (und Toren), absteigend. */
export function venueRanking(matches: Match[], top: number): VenueRow[] {
  const acc = new Map<string, VenueRow>();
  for (const m of matches) {
    if (!m.score || !m.ground) continue;
    let row = acc.get(m.ground);
    if (!row) {
      row = { venue: m.ground, matches: 0, goals: 0 };
      acc.set(m.ground, row);
    }
    row.matches++;
    row.goals += totalGoals(m);
  }
  return [...acc.values()]
    .sort((a, b) => b.matches - a.matches || b.goals - a.goals)
    .slice(0, top);
}
