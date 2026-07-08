import type { Match } from "../types";
import { finalScore } from "./knockout";

export interface Tip {
  goals1: number;
  goals2: number;
}

/** Tipps, adressiert über matchKey() */
export type TipMap = Record<string, Tip>;

export function matchKey(match: Match): string {
  return match.num !== undefined
    ? `m${match.num}`
    : `${match.date}|${match.team1}|${match.team2}`;
}

/**
 * Punkte für einen Tipp, bewertet gegen den Endstand nach 90 Min. bzw.
 * Verlängerung (Elfmeterschießen zählt nicht):
 * exakt = 3, richtige Tordifferenz = 2, richtige Tendenz = 1, sonst 0.
 * null, solange das Spiel nicht gespielt ist.
 */
export function tipPoints(tip: Tip, match: Match): number | null {
  if (!match.score) return null;
  const [g1, g2] = finalScore(match.score);
  if (tip.goals1 === g1 && tip.goals2 === g2) return 3;
  if (tip.goals1 - tip.goals2 === g1 - g2) return 2;
  const tendency = Math.sign(tip.goals1 - tip.goals2);
  if (tendency === Math.sign(g1 - g2)) return 1;
  return 0;
}

export interface TipSummary {
  points: number;
  evaluated: number;
  exact: number;
  open: number;
}

export function summarizeTips(tips: TipMap, matches: Match[]): TipSummary {
  let points = 0;
  let evaluated = 0;
  let exact = 0;
  let open = 0;
  for (const match of matches) {
    const tip = tips[matchKey(match)];
    if (!tip) continue;
    const p = tipPoints(tip, match);
    if (p === null) {
      open++;
      continue;
    }
    evaluated++;
    points += p;
    if (p === 3) exact++;
  }
  return { points, evaluated, exact, open };
}
