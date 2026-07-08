import type { Match } from "../types";
import { finalScore } from "../lib/knockout";
import { computeScorers } from "../lib/scorers";
import { matchDate, roundName, teamName } from "../lib/i18n";
import { MatchCard } from "./MatchCard";

export function Overview({ matches }: { matches: Match[] }) {
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
      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{roundName(currentStage.round)}</span>
          <span className="stat-label">
            {upcoming.length > 0 ? "Nächste Runde" : "Turnier beendet"}
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
