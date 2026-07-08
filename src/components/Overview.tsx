import { useEffect, useState } from "react";
import type { Match } from "../types";
import { finalScore } from "../lib/knockout";
import { computeScorers } from "../lib/scorers";
import { matchDate, roundName, teamFlag, teamName } from "../lib/i18n";
import { teamHash } from "../lib/router";
import { loadJson } from "../lib/storage";
import { MatchCard } from "./MatchCard";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0
    ? `${d} T ${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function Countdown({ match }: { match: Match }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = matchDate(match).getTime() - now;

  return (
    <div className="stat-tile countdown-tile">
      <span className="stat-value countdown">
        {diff <= 0 ? "Anpfiff!" : formatCountdown(diff)}
      </span>
      <span className="stat-label">
        Nächster Anpfiff · {teamName(match.team1)} – {teamName(match.team2)}
      </span>
    </div>
  );
}

function FavoriteCard({
  team,
  matches,
}: {
  team: string;
  matches: Match[];
}) {
  const teamMatches = matches
    .filter((m) => m.team1 === team || m.team2 === team)
    .sort((a, b) => matchDate(a).getTime() - matchDate(b).getTime());
  if (teamMatches.length === 0) return null;
  const next = teamMatches.find((m) => !m.score);
  const last = [...teamMatches].reverse().find((m) => m.score);
  const shown = next ?? last;

  return (
    <div className="favorite-card">
      <h2>
        <a className="team-link" href={teamHash(team)}>
          <span className="flag">{teamFlag(team)}</span> Mein Team:{" "}
          {teamName(team)}
        </a>
      </h2>
      <p className="hint favorite-hint">
        {next ? "Nächstes Spiel" : "Letztes Spiel"} ·{" "}
        {shown && roundName(shown.round)}
      </p>
      {shown && <MatchCard match={shown} />}
    </div>
  );
}

export function Overview({ matches }: { matches: Match[] }) {
  const favorite = loadJson<string | null>("favorite", null);
  const played = matches
    .filter((m) => m.score)
    .sort((a, b) => matchDate(b).getTime() - matchDate(a).getTime());
  const upcoming = matches
    .filter((m) => !m.score)
    .sort((a, b) => matchDate(a).getTime() - matchDate(b).getTime());

  const totalGoals = played.reduce((sum, m) => {
    const [g1, g2] = finalScore(m.score!);
    return sum + g1 + g2;
  }, 0);
  const topScorer = computeScorers(matches)[0];
  const currentStage = upcoming[0] ?? played[0];

  return (
    <section>
      {favorite && <FavoriteCard team={favorite} matches={matches} />}

      <div className="stat-grid">
        {upcoming[0] ? (
          <Countdown match={upcoming[0]} />
        ) : (
          <div className="stat-tile">
            <span className="stat-value">{roundName(currentStage.round)}</span>
            <span className="stat-label">Turnier beendet</span>
          </div>
        )}
        <div className="stat-tile">
          <span className="stat-value">{roundName(currentStage.round)}</span>
          <span className="stat-label">
            {upcoming.length > 0 ? "Nächste Runde" : "Letzte Runde"}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {played.length}
            <small> / {matches.length}</small>
          </span>
          <span className="stat-label">Spiele gespielt</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">
            {totalGoals}
            <small>
              {" "}
              (Ø {played.length > 0 ? (totalGoals / played.length).toFixed(2) : "0"})
            </small>
          </span>
          <span className="stat-label">Tore (pro Spiel)</span>
        </div>
        {topScorer && (
          <div className="stat-tile">
            <span className="stat-value">
              {topScorer.name}
              <small> ({topScorer.goals} Tore)</small>
            </span>
            <span className="stat-label">
              Bester Torschütze · {teamName(topScorer.team)}
            </span>
          </div>
        )}
      </div>

      <div className="overview-columns">
        <div>
          <h2>Letzte Ergebnisse</h2>
          {played.slice(0, 5).map((m, i) => (
            <MatchCard key={i} match={m} />
          ))}
        </div>
        <div>
          <h2>Nächste Spiele</h2>
          {upcoming.length === 0 && <p>Keine ausstehenden Spiele.</p>}
          {upcoming.slice(0, 5).map((m, i) => (
            <MatchCard key={i} match={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
