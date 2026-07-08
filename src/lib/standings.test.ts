import { describe, expect, it } from "vitest";
import type { Match, Tournament } from "../types";
import { computeStandings } from "./standings";
import snapshot from "../data/worldcup2026-snapshot.json";

const tournament = snapshot as Tournament;

describe("computeStandings", () => {
  it("berechnet Punkte, Tore und Reihenfolge (synthetische Gruppe)", () => {
    const matches: Match[] = [
      { round: "Matchday 1", date: "2026-06-11", team1: "A", team2: "B", group: "Group X", score: { ft: [2, 0] } },
      { round: "Matchday 2", date: "2026-06-12", team1: "C", team2: "D", group: "Group X", score: { ft: [1, 1] } },
      { round: "Matchday 3", date: "2026-06-13", team1: "A", team2: "C", group: "Group X", score: { ft: [0, 0] } },
      // Noch nicht gespielt – darf nur dafür sorgen, dass B/D gelistet sind:
      { round: "Matchday 4", date: "2026-06-14", team1: "B", team2: "D", group: "Group X" },
    ];
    const rows = computeStandings(matches).get("Group X")!;

    expect(rows.map((r) => r.team)).toEqual(["A", "C", "D", "B"]);
    const a = rows[0];
    expect(a).toMatchObject({ played: 2, won: 1, drawn: 1, lost: 0, points: 4, goalDiff: 2 });
    expect(rows[2]).toMatchObject({ team: "D", points: 1, goalDiff: 0 });
    expect(rows[3]).toMatchObject({ team: "B", points: 0, goalDiff: -2 });
  });

  it("liefert 12 Gruppen à 4 Teams aus dem Snapshot", () => {
    const standings = computeStandings(tournament.matches);
    expect(standings.size).toBe(12);
    for (const rows of standings.values()) {
      expect(rows).toHaveLength(4);
      expect(rows.reduce((s, r) => s + r.played, 0)).toBe(12); // 6 Spiele à 2 Teams
    }
  });

  it("Gruppe A: Mexiko gewinnt alle drei Spiele", () => {
    const rows = computeStandings(tournament.matches).get("Group A")!;
    expect(rows[0].team).toBe("Mexico");
    expect(rows[0].points).toBe(9);
    expect(rows[0].goalsAgainst).toBe(0);
  });
});
