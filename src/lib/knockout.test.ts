import { describe, expect, it } from "vitest";
import type { Match, Tournament } from "../types";
import { finalScore, knockoutRounds, resolvePlaceholders, winner } from "./knockout";
import snapshot from "../data/worldcup2026-snapshot.json";

const tournament = snapshot as Tournament;

describe("winner / finalScore", () => {
  it("wertet reguläre Spielzeit aus", () => {
    const m: Match = { round: "Final", date: "2026-07-19", team1: "A", team2: "B", score: { ft: [2, 1] } };
    expect(winner(m)).toBe("A");
  });

  it("wertet Verlängerung aus", () => {
    const m: Match = { round: "Final", date: "2026-07-19", team1: "A", team2: "B", score: { ft: [1, 1], et: [1, 2] } };
    expect(finalScore(m.score!)).toEqual([1, 2]);
    expect(winner(m)).toBe("B");
  });

  it("Elfmeterschießen schlägt Verlängerung", () => {
    const m: Match = { round: "Final", date: "2026-07-19", team1: "A", team2: "B", score: { ft: [1, 1], et: [1, 1], p: [3, 4] } };
    expect(winner(m)).toBe("B");
  });

  it("kein Sieger ohne Ergebnis", () => {
    const m: Match = { round: "Final", date: "2026-07-19", team1: "A", team2: "B" };
    expect(winner(m)).toBeNull();
  });

  it("Snapshot: Paraguay gewinnt gegen Deutschland im Elfmeterschießen", () => {
    const m = tournament.matches.find((x) => x.num === 74)!;
    expect(winner(m)).toBe("Paraguay");
  });
});

describe("resolvePlaceholders", () => {
  it("löst W95/W96 im Viertelfinale auf (Spiel 100)", () => {
    const resolved = resolvePlaceholders(tournament.matches);
    const qf = resolved.find((m) => m.num === 100)!;
    // Spiel 95: Argentinien 3:2 Ägypten, Spiel 96: Schweiz i.E. gegen Kolumbien
    expect(qf.team1).toBe("Argentina");
    expect(qf.team2).toBe("Switzerland");
  });

  it("lässt Platzhalter für unentschiedene Spiele stehen", () => {
    const resolved = resolvePlaceholders(tournament.matches);
    const final = resolved.find((m) => m.round === "Final")!;
    // Halbfinals sind noch nicht gespielt
    expect(final.team1).toMatch(/^W\d+$/);
  });

  it("verändert die Eingabe nicht", () => {
    const before = JSON.stringify(tournament.matches);
    resolvePlaceholders(tournament.matches);
    expect(JSON.stringify(tournament.matches)).toBe(before);
  });
});

describe("knockoutRounds", () => {
  it("liefert alle K.o.-Runden in Turnierreihenfolge", () => {
    const rounds = knockoutRounds(tournament.matches);
    expect([...rounds.keys()]).toEqual([
      "Round of 32",
      "Round of 16",
      "Quarter-final",
      "Semi-final",
      "Match for third place",
      "Final",
    ]);
    expect(rounds.get("Round of 32")).toHaveLength(16);
    expect(rounds.get("Final")).toHaveLength(1);
  });
});
