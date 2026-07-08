import { describe, expect, it } from "vitest";
import type { Match } from "../types";
import { matchKey, summarizeTips, tipPoints } from "./tips";

const played: Match = {
  round: "Final", date: "2026-07-19", num: 104,
  team1: "A", team2: "B",
  score: { ft: [2, 1] },
};

describe("tipPoints", () => {
  it("exaktes Ergebnis = 3 Punkte", () => {
    expect(tipPoints({ goals1: 2, goals2: 1 }, played)).toBe(3);
  });

  it("richtige Tordifferenz = 2 Punkte", () => {
    expect(tipPoints({ goals1: 3, goals2: 2 }, played)).toBe(2);
  });

  it("richtige Tendenz = 1 Punkt", () => {
    expect(tipPoints({ goals1: 4, goals2: 0 }, played)).toBe(1);
  });

  it("daneben = 0 Punkte", () => {
    expect(tipPoints({ goals1: 0, goals2: 1 }, played)).toBe(0);
  });

  it("Unentschieden getippt, anderes Unentschieden = 2 Punkte", () => {
    const draw: Match = { ...played, score: { ft: [1, 1] } };
    expect(tipPoints({ goals1: 2, goals2: 2 }, draw)).toBe(2);
  });

  it("K.o.-Spiel: Endstand nach Verlängerung zählt, i.E. nicht", () => {
    const ko: Match = {
      ...played,
      score: { ft: [1, 1], et: [1, 1], p: [4, 2] },
    };
    // 1:1 nach Verlängerung → Tipp 1:1 ist exakt, trotz i.E.-Sieg von A
    expect(tipPoints({ goals1: 1, goals2: 1 }, ko)).toBe(3);
    expect(tipPoints({ goals1: 2, goals2: 1 }, ko)).toBe(0);
  });

  it("ungespieltes Spiel → null", () => {
    const future: Match = { round: "Final", date: "2026-07-19", team1: "A", team2: "B" };
    expect(tipPoints({ goals1: 1, goals2: 0 }, future)).toBeNull();
  });
});

describe("summarizeTips / matchKey", () => {
  it("summiert Punkte und zählt offene Tipps", () => {
    const future: Match = { round: "Semi-final", date: "2026-07-14", num: 101, team1: "C", team2: "D" };
    const tips = {
      [matchKey(played)]: { goals1: 2, goals2: 1 },
      [matchKey(future)]: { goals1: 1, goals2: 0 },
    };
    expect(summarizeTips(tips, [played, future])).toEqual({
      points: 3,
      evaluated: 1,
      exact: 1,
      open: 1,
    });
  });

  it("matchKey nutzt Spielnummer, sonst Datum+Teams", () => {
    expect(matchKey(played)).toBe("m104");
    const groupMatch: Match = { round: "Matchday 1", date: "2026-06-11", team1: "X", team2: "Y" };
    expect(matchKey(groupMatch)).toBe("2026-06-11|X|Y");
  });
});
