import type { Match } from "../types";
import { finalScore } from "../lib/knockout";
import { formatMatchDateTime, groupName, roundName } from "../lib/i18n";
import { TeamLink } from "./TeamLink";
import { Timeline } from "./Timeline";

export function MatchCard({ match }: { match: Match }) {
  const score = match.score;
  const ft = score ? finalScore(score) : null;
  const hasGoals =
    (match.goals1?.length ?? 0) + (match.goals2?.length ?? 0) > 0;
  const context = match.group
    ? `${groupName(match.group)} · ${roundName(match.round)}`
    : roundName(match.round);

  return (
    <article className="match-card">
      <div className="match-meta">
        <span>{context}</span>
        <span>
          {formatMatchDateTime(match)}
          {match.ground && ` · ${match.ground}`}
        </span>
      </div>
      <div className="match-line">
        <span className="match-team home">
          <TeamLink team={match.team1} flagLast />
        </span>
        {ft ? (
          <span className="match-score">
            {ft[0]}:{ft[1]}
            {score?.p && (
              <small>
                {" "}
                i.E. {score.p[0]}:{score.p[1]}
              </small>
            )}
            {!score?.p && score?.et && <small> n.V.</small>}
          </span>
        ) : (
          <span className="match-score upcoming">–:–</span>
        )}
        <span className="match-team away">
          <TeamLink team={match.team2} />
        </span>
      </div>
      {(hasGoals || score?.p) && (
        <details className="match-goals">
          <summary>Spielverlauf</summary>
          <Timeline match={match} />
        </details>
      )}
    </article>
  );
}
