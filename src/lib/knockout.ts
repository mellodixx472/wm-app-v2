import type { Match, Score } from "../types";

export const KO_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Match for third place",
  "Final",
] as const;

/** Endstand eines Spiels: Elfmeterschießen > Verlängerung > reguläre Spielzeit */
export function finalScore(score: Score): [number, number] {
  return score.et ?? score.ft;
}

export function winner(match: Match): string | null {
  if (!match.score) return null;
  const [g1, g2] = match.score.p ?? finalScore(match.score);
  if (g1 === g2) return null;
  return g1 > g2 ? match.team1 : match.team2;
}

export function loser(match: Match): string | null {
  const w = winner(match);
  if (w === null) return null;
  return w === match.team1 ? match.team2 : match.team1;
}

const PLACEHOLDER = /^([WL])(\d+)$/;

/**
 * Ersetzt Platzhalter wie "W95" / "L101" durch echte Teamnamen,
 * sobald das referenzierte Spiel entschieden ist.
 */
export function resolvePlaceholders(matches: Match[]): Match[] {
  const byNum = new Map<number, Match>();
  for (const match of matches) {
    if (match.num !== undefined) byNum.set(match.num, match);
  }

  const resolveTeam = (name: string, depth = 0): string => {
    const m = PLACEHOLDER.exec(name);
    if (!m || depth > KO_ROUNDS.length) return name;
    const ref = byNum.get(Number(m[2]));
    if (!ref) return name;
    // Das referenzierte Spiel kann selbst noch Platzhalter enthalten.
    const resolved = {
      ...ref,
      team1: resolveTeam(ref.team1, depth + 1),
      team2: resolveTeam(ref.team2, depth + 1),
    };
    const team = m[1] === "W" ? winner(resolved) : loser(resolved);
    return team ?? name;
  };

  return matches.map((match) => ({
    ...match,
    team1: resolveTeam(match.team1),
    team2: resolveTeam(match.team2),
  }));
}

/** K.o.-Spiele nach Runde gruppiert, in Turnierreihenfolge */
export function knockoutRounds(matches: Match[]): Map<string, Match[]> {
  const result = new Map<string, Match[]>();
  for (const round of KO_ROUNDS) {
    const roundMatches = matches
      .filter((m) => m.round === round)
      .sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
    if (roundMatches.length > 0) result.set(round, roundMatches);
  }
  return result;
}
