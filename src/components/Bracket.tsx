import type { Match } from "../types";
import { finalScore, knockoutRounds, winner } from "../lib/knockout";
import {
  formatMatchDate,
  roundName,
  teamFlag,
  teamName,
} from "../lib/i18n";

function BracketTeam({ team, match }: { team: string; match: Match }) {
  const isWinner = winner(match) === team;
  const [g1, g2] = match.score ? finalScore(match.score) : [null, null];
  const goals = team === match.team1 ? g1 : g2;
  const pens = match.score?.p
    ? team === match.team1
      ? match.score.p[0]
      : match.score.p[1]
    : null;

  return (
    <div className={`bracket-team${isWinner ? " winner" : ""}`}>
      <span className="bracket-name">
        <span className="flag">{teamFlag(team)}</span> {teamName(team)}
      </span>
      <span className="bracket-score">
        {goals !== null ? goals : ""}
        {pens !== null && <small> ({pens})</small>}
      </span>
    </div>
  );
}

function BracketMatch({ match }: { match: Match }) {
  return (
    <div className="bracket-match">
      <div className="bracket-info">
        Spiel {match.num} · {formatMatchDate(match)}
        {match.score?.p
          ? " · i.E."
          : match.score?.et
            ? " · n.V."
            : ""}
      </div>
      <BracketTeam team={match.team1} match={match} />
      <BracketTeam team={match.team2} match={match} />
    </div>
  );
}

export function Bracket({ matches }: { matches: Match[] }) {
  const rounds = knockoutRounds(matches);
  const columns = [...rounds.entries()].filter(
    ([round]) => round !== "Match for third place",
  );
  const thirdPlace = rounds.get("Match for third place");

  return (
    <section>
      <div className="bracket-scroll">
        <div className="bracket">
          {columns.map(([round, roundMatches]) => (
            <div className="bracket-round" key={round}>
              <h3>{roundName(round)}</h3>
              <div className="bracket-column">
                {roundMatches.map((m) => (
                  <BracketMatch key={m.num} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {thirdPlace && (
        <div className="third-place">
          <h3>{roundName("Match for third place")}</h3>
          {thirdPlace.map((m) => (
            <BracketMatch key={m.num} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}
