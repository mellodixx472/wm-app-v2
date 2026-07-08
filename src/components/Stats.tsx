import type { Match } from "../types";
import { finalScore } from "../lib/knockout";
import {
  decidedLate,
  goalsByPhase,
  highestScoringMatches,
  ownGoals,
  penaltyGoalCount,
  venueRanking,
} from "../lib/stats";
import { roundName, teamName } from "../lib/i18n";
import { MatchCard } from "./MatchCard";

export function Stats({ matches }: { matches: Match[] }) {
  const phases = goalsByPhase(matches);
  const topMatches = highestScoringMatches(matches, 5);
  const og = ownGoals(matches);
  const { extraTime, shootout } = decidedLate(matches);
  const venues = venueRanking(matches, 5);
  const penalties = penaltyGoalCount(matches);

  return (
    <section>
      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{penalties}</span>
          <span className="stat-label">Verwandelte Elfmeter (im Spiel)</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{og.length}</span>
          <span className="stat-label">Eigentore</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{extraTime.length}</span>
          <span className="stat-label">Entscheidungen in der Verlängerung</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{shootout.length}</span>
          <span className="stat-label">Elfmeterschießen</span>
        </div>
      </div>

      <div className="overview-columns">
        <div>
          <h2>Torreichste Spiele</h2>
          {topMatches.map((m, i) => (
            <MatchCard key={m.num ?? `${m.date}-${i}`} match={m} />
          ))}
        </div>
        <div>
          <h2>Tore je Phase</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th className="team-col">Phase</th>
                <th>Spiele</th>
                <th>Tore</th>
                <th>Ø</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p) => (
                <tr key={p.phase}>
                  <td className="team-col">
                    {p.phase === "Gruppenphase" ? p.phase : roundName(p.phase)}
                  </td>
                  <td>{p.matches}</td>
                  <td className="points">{p.goals}</td>
                  <td>{p.average.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Spielorte (meiste Spiele)</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th className="team-col">Spielort</th>
                <th>Spiele</th>
                <th>Tore</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.venue}>
                  <td className="team-col">{v.venue}</td>
                  <td>{v.matches}</td>
                  <td className="points">{v.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Eigentore</h2>
          {og.length === 0 && <p className="hint">Bisher keine Eigentore.</p>}
          <ul className="plain-list">
            {og.map((e, i) => {
              const [g1, g2] = finalScore(e.match.score!);
              const opponent =
                e.benefitedTeam === e.match.team1
                  ? e.match.team2
                  : e.match.team1;
              return (
                <li key={i}>
                  {e.goal.minute}&prime; <strong>{e.goal.name}</strong> (
                  {teamName(opponent)}) – {teamName(e.match.team1)}{" "}
                  {g1}:{g2} {teamName(e.match.team2)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
