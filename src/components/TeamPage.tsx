import { useState } from "react";
import type { Match } from "../types";
import { finalScore, loser, winner } from "../lib/knockout";
import { computeScorers } from "../lib/scorers";
import { matchDate, roundName, teamFlag, teamName } from "../lib/i18n";
import { loadJson, saveJson } from "../lib/storage";
import { MatchCard } from "./MatchCard";

function teamRecord(team: string, played: Match[]) {
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const m of played) {
    const [g1, g2] = finalScore(m.score!);
    const [gf, ga] = m.team1 === team ? [g1, g2] : [g2, g1];
    goalsFor += gf;
    goalsAgainst += ga;
    const w = winner(m);
    if (w === team) won++;
    else if (w === null) drawn++;
    else lost++;
  }
  return { won, drawn, lost, goalsFor, goalsAgainst };
}

function statusLine(team: string, teamMatches: Match[]): string {
  const koLoss = teamMatches.find(
    (m) => !m.group && m.score && loser(m) === team,
  );
  if (koLoss) {
    const opponent = koLoss.team1 === team ? koLoss.team2 : koLoss.team1;
    return `Ausgeschieden im ${roundName(koLoss.round)} gegen ${teamName(opponent)}`;
  }
  const finalMatch = teamMatches.find((m) => m.round === "Final" && m.score);
  if (finalMatch && winner(finalMatch) === team) return "Weltmeister 2026! 🏆";
  const upcoming = teamMatches.filter((m) => !m.score);
  if (upcoming.length > 0) {
    const next = upcoming.sort(
      (a, b) => matchDate(a).getTime() - matchDate(b).getTime(),
    )[0];
    return `Noch im Turnier – nächstes Spiel: ${roundName(next.round)}`;
  }
  const playedKo = teamMatches.some((m) => !m.group);
  return playedKo
    ? "Turnier beendet"
    : "In der Gruppenphase ausgeschieden";
}

export function TeamPage({
  team,
  matches,
}: {
  team: string;
  matches: Match[];
}) {
  const [favorite, setFavorite] = useState<string | null>(() =>
    loadJson<string | null>("favorite", null),
  );

  const teamMatches = matches
    .filter((m) => m.team1 === team || m.team2 === team)
    .sort((a, b) => matchDate(a).getTime() - matchDate(b).getTime());

  if (teamMatches.length === 0) {
    return (
      <section>
        <p className="loading">Team „{teamName(team)}" nicht gefunden.</p>
      </section>
    );
  }

  const played = teamMatches.filter((m) => m.score);
  const record = teamRecord(team, played);
  const scorers = computeScorers(teamMatches).filter((s) => s.team === team);
  const isFavorite = favorite === team;

  const toggleFavorite = () => {
    const next = isFavorite ? null : team;
    setFavorite(next);
    saveJson("favorite", next);
  };

  return (
    <section>
      <div className="team-head">
        <a className="back-link" href="#uebersicht">
          ‹ Zurück
        </a>
        <h2 className="team-title">
          <span className="flag big-flag">{teamFlag(team)}</span>{" "}
          {teamName(team)}
          <button
            className={`icon-button star${isFavorite ? " active" : ""}`}
            onClick={toggleFavorite}
            title={
              isFavorite
                ? "Als Favorit entfernen"
                : "Als Favoriten-Team merken"
            }
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </h2>
        <p className="team-status">{statusLine(team, teamMatches)}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{played.length}</span>
          <span className="stat-label">Spiele</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {record.won} / {record.drawn} / {record.lost}
          </span>
          <span className="stat-label">S / U / N</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {record.goalsFor}:{record.goalsAgainst}
          </span>
          <span className="stat-label">Torverhältnis</span>
        </div>
        {scorers[0] && (
          <div className="stat-tile">
            <span className="stat-value">
              {scorers[0].name}
              <small> ({scorers[0].goals})</small>
            </span>
            <span className="stat-label">Bester Torschütze</span>
          </div>
        )}
      </div>

      <div className="overview-columns">
        <div>
          <h2>Alle Spiele</h2>
          {teamMatches.map((m, i) => (
            <MatchCard key={m.num ?? `${m.date}-${i}`} match={m} />
          ))}
        </div>
        <div>
          <h2>Torschützen</h2>
          {scorers.length === 0 && <p className="hint">Noch keine Tore.</p>}
          {scorers.length > 0 && (
            <table className="scorer-table">
              <thead>
                <tr>
                  <th className="pos">#</th>
                  <th className="team-col">Spieler</th>
                  <th>Tore</th>
                  <th title="davon Elfmeter">Elfm.</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((row, i) => (
                  <tr key={row.name}>
                    <td className="pos">{i + 1}</td>
                    <td className="team-col">{row.name}</td>
                    <td className="points">{row.goals}</td>
                    <td>{row.penalties || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
