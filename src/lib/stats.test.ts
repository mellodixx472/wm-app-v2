import { describe, expect, it } from "vitest";
import type { Match, Tournament } from "../types";
import {
  decidedLate,
  goalsByPhase,
  highestScoringMatches,
  ownGoals,
  penaltyGoalCount,
  venueRanking,
} from "./stats";
import snapshot from "../data/worldcup2026-snapshot.json";

const tournament = snapshot as Tournament;

const synthetic: Match[] = [
  {
    round: "Matchday 1", date: "2026-06-11", team1: "A", team2: "B",
    group: "Group X", ground: "Ort 1",
    score: { ft: [3, 2] },
    goals1: [
      { name: "P1", minute: "10" },
      { name: "P1", minute: "20", penalty: true },
      { name: "Gegner-ET", minute: "30", owngoal: true },
    ],
    goals2: [
      { name: "P2", minute: "40" },
      { name: "P3", minute: "50" },
    ],
  },
  {
    round: "Final", date: "2026-07-19", team1: "A", team2: "B", ground: "Ort 1",
    score: { ft: [1, 1], et: [2, 1] },
  },
  {
    round: "Semi-final", date: "2026-07-14", team1: "C", team2: "D", ground: "Ort 2",
    score: { ft: [0, 0], et: [0, 0], p: [4, 2] },
  },
  // Ungespielt – darf nirgends einfließen
  { round: "Matchday 2", date: "2026-06-12", team1: "C", team2: "D", group: "Group X", ground: "Ort 2" },
];

describe("stats (synthetisch)", () => {
  it("findet torreichste Spiele nach Endstand inkl. Verlängerung", () => {
    const top = highestScoringMatches(synthetic, 2);
    expect(top[0].round).toBe("Matchday 1"); // 5 Tore
    expect(top[1].round).toBe("Final"); // 3 Tore (2:1 n.V.)
  });

  it("bündelt Tore je Phase", () => {
    const phases = goalsByPhase(synthetic);
    expect(phases).toEqual([
      { phase: "Gruppenphase", matches: 1, goals: 5, average: 5 },
      { phase: "Final", matches: 1, goals: 3, average: 3 },
      { phase: "Semi-final", matches: 1, goals: 0, average: 0 },
    ]);
  });

  it("zählt Elfmeter im Spiel, aber keine Eigentore", () => {
    expect(penaltyGoalCount(synthetic)).toBe(1);
  });

  it("listet Eigentore mit begünstigtem Team", () => {
    const og = ownGoals(synthetic);
    expect(og).toHaveLength(1);
    expect(og[0].benefitedTeam).toBe("A");
    expect(og[0].goal.name).toBe("Gegner-ET");
  });

  it("trennt n.V.- und i.E.-Entscheidungen", () => {
    const { extraTime, shootout } = decidedLate(synthetic);
    expect(extraTime.map((m) => m.round)).toEqual(["Final"]);
    expect(shootout.map((m) => m.round)).toEqual(["Semi-final"]);
  });

  it("rankt Spielorte nach gespielten Partien", () => {
    const venues = venueRanking(synthetic, 5);
    expect(venues[0]).toEqual({ venue: "Ort 1", matches: 2, goals: 8 });
    expect(venues[1]).toEqual({ venue: "Ort 2", matches: 1, goals: 0 });
  });
});

describe("stats (Snapshot)", () => {
  it("Phasen-Summen entsprechen der Gesamttorzahl", () => {
    const phases = goalsByPhase(tournament.matches);
    const total = phases.reduce((s, p) => s + p.goals, 0);
    expect(total).toBeGreaterThan(250);
    expect(phases[0].phase).toBe("Gruppenphase");
    expect(phases[0].matches).toBe(72);
  });

  it("liefert Eigentore und Spielorte aus echten Daten", () => {
    expect(ownGoals(tournament.matches).length).toBeGreaterThan(0);
    const venues = venueRanking(tournament.matches, 3);
    expect(venues[0].matches).toBeGreaterThanOrEqual(venues[1].matches);
  });
});
