import { describe, expect, it } from "vitest";
import type { Match, Tournament } from "../types";
import { computeScorers } from "./scorers";
import snapshot from "../data/worldcup2026-snapshot.json";

const tournament = snapshot as Tournament;

describe("computeScorers", () => {
  it("zählt Tore pro Spieler und schließt Eigentore aus", () => {
    const matches: Match[] = [
      {
        round: "Matchday 1",
        date: "2026-06-11",
        team1: "A",
        team2: "B",
        score: { ft: [3, 1] },
        goals1: [
          { name: "Alice", minute: "10" },
          { name: "Alice", minute: "55", penalty: true },
          { name: "Bob-Eigentor", minute: "70", owngoal: true },
        ],
        goals2: [{ name: "Carol", minute: "80" }],
      },
    ];
    const rows = computeScorers(matches);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: "Alice", team: "A", goals: 2, penalties: 1 });
    expect(rows[1]).toMatchObject({ name: "Carol", team: "B", goals: 1 });
  });

  it("sortiert bei Torgleichheit weniger Elfmeter nach vorn", () => {
    const matches: Match[] = [
      {
        round: "Matchday 1",
        date: "2026-06-11",
        team1: "A",
        team2: "B",
        score: { ft: [1, 1] },
        goals1: [{ name: "Elfer", minute: "10", penalty: true }],
        goals2: [{ name: "Feldtor", minute: "20" }],
      },
    ];
    const rows = computeScorers(matches);
    expect(rows.map((r) => r.name)).toEqual(["Feldtor", "Elfer"]);
  });

  it("Snapshot: Torschützenliste ist gefüllt und konsistent", () => {
    const rows = computeScorers(tournament.matches);
    expect(rows.length).toBeGreaterThan(50);
    // Summe der Spieler-Tore = alle Tore ohne Eigentore
    const expected = tournament.matches
      .flatMap((m) => [...(m.goals1 ?? []), ...(m.goals2 ?? [])])
      .filter((g) => !g.owngoal).length;
    expect(rows.reduce((s, r) => s + r.goals, 0)).toBe(expected);
    expect(rows[0].goals).toBeGreaterThanOrEqual(rows[1].goals);
  });
});
