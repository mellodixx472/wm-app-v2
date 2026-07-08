import { useState } from "react";
import type { Match } from "../types";
import { finalScore } from "../lib/knockout";
import {
  matchKey,
  summarizeTips,
  tipPoints,
  type Tip,
  type TipMap,
} from "../lib/tips";
import {
  formatMatchDateTime,
  matchDate,
  roundName,
  teamFlag,
  teamName,
} from "../lib/i18n";
import { loadJson, saveJson } from "../lib/storage";

function TipInput({
  match,
  tip,
  onChange,
}: {
  match: Match;
  tip: Tip | undefined;
  onChange: (tip: Tip | null) => void;
}) {
  const update = (side: keyof Tip, raw: string) => {
    if (raw === "") {
      onChange(null);
      return;
    }
    const value = Math.max(0, Math.min(20, Number(raw)));
    onChange({
      goals1: side === "goals1" ? value : (tip?.goals1 ?? 0),
      goals2: side === "goals2" ? value : (tip?.goals2 ?? 0),
    });
  };

  return (
    <span className="tip-inputs">
      <input
        type="number"
        min={0}
        max={20}
        inputMode="numeric"
        value={tip?.goals1 ?? ""}
        onChange={(e) => update("goals1", e.target.value)}
        aria-label={`Tipp Tore ${teamName(match.team1)}`}
      />
      <span>:</span>
      <input
        type="number"
        min={0}
        max={20}
        inputMode="numeric"
        value={tip?.goals2 ?? ""}
        onChange={(e) => update("goals2", e.target.value)}
        aria-label={`Tipp Tore ${teamName(match.team2)}`}
      />
    </span>
  );
}

export function Tips({ matches }: { matches: Match[] }) {
  const [tips, setTips] = useState<TipMap>(() => loadJson("tips", {}));

  const setTip = (match: Match, tip: Tip | null) => {
    const next = { ...tips };
    if (tip === null) delete next[matchKey(match)];
    else next[matchKey(match)] = tip;
    setTips(next);
    saveJson("tips", next);
  };

  const upcoming = matches
    .filter((m) => !m.score)
    .sort((a, b) => matchDate(a).getTime() - matchDate(b).getTime());
  const evaluated = matches
    .filter((m) => m.score && tips[matchKey(m)])
    .sort((a, b) => matchDate(b).getTime() - matchDate(a).getTime());
  const summary = summarizeTips(tips, matches);

  return (
    <section>
      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{summary.points}</span>
          <span className="stat-label">Punkte gesamt</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{summary.evaluated}</span>
          <span className="stat-label">Gewertete Tipps</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{summary.exact}</span>
          <span className="stat-label">Exakt getroffen</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{summary.open}</span>
          <span className="stat-label">Offene Tipps</span>
        </div>
      </div>
      <p className="hint">
        Exakt = 3 Punkte · richtige Tordifferenz = 2 · richtige Tendenz = 1.
        Bei K.o.-Spielen zählt der Stand nach 90 Min. bzw. Verlängerung. Tipps
        werden nur lokal auf diesem Gerät gespeichert.
      </p>

      <div className="overview-columns">
        <div>
          <h2>Jetzt tippen</h2>
          {upcoming.length === 0 && <p>Keine offenen Spiele mehr.</p>}
          {upcoming.map((m) => (
            <div className="match-card tip-card" key={matchKey(m)}>
              <div className="match-meta">
                <span>{roundName(m.round)}</span>
                <span>{formatMatchDateTime(m)}</span>
              </div>
              <div className="match-line">
                <span className="match-team home">
                  {teamName(m.team1)}{" "}
                  <span className="flag">{teamFlag(m.team1)}</span>
                </span>
                <TipInput
                  match={m}
                  tip={tips[matchKey(m)]}
                  onChange={(tip) => setTip(m, tip)}
                />
                <span className="match-team away">
                  <span className="flag">{teamFlag(m.team2)}</span>{" "}
                  {teamName(m.team2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h2>Ausgewertete Tipps</h2>
          {evaluated.length === 0 && (
            <p className="hint">
              Noch keine getippten Spiele beendet.
            </p>
          )}
          {evaluated.map((m) => {
            const tip = tips[matchKey(m)]!;
            const points = tipPoints(tip, m)!;
            const [g1, g2] = finalScore(m.score!);
            return (
              <div className="match-card" key={matchKey(m)}>
                <div className="match-meta">
                  <span>{roundName(m.round)}</span>
                  <span className={`tip-points p${points}`}>
                    {points} {points === 1 ? "Punkt" : "Punkte"}
                  </span>
                </div>
                <div className="match-line">
                  <span className="match-team home">
                    {teamName(m.team1)}{" "}
                    <span className="flag">{teamFlag(m.team1)}</span>
                  </span>
                  <span className="match-score">
                    {g1}:{g2}
                    <small> Tipp {tip.goals1}:{tip.goals2}</small>
                  </span>
                  <span className="match-team away">
                    <span className="flag">{teamFlag(m.team2)}</span>{" "}
                    {teamName(m.team2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
