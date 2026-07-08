import type { Goal, Match } from "../types";
import { finalScore } from "../lib/knockout";
import {
  formatMatchDateTime,
  groupName,
  roundName,
  teamFlag,
  teamName,
} from "../lib/i18n";

function GoalList({ goals }: { goals: Goal[] }) {
  return (
    <ul className="goal-list">
      {goals.map((goal, i) => (
        <li key={i}>
          {goal.minute}&prime; {goal.name}
          {goal.penalty && " (Elfmeter)"}
          {goal.owngoal && " (Eigentor)"}
        </li>
      ))}
    </ul>
  );
}

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
          {teamName(match.team1)} <span className="flag">{teamFlag(match.team1)}</span>
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
          <span className="flag">{teamFlag(match.team2)}</span> {teamName(match.team2)}
        </span>
      </div>
      {hasGoals && (
        <details className="match-goals">
          <summary>Torschützen</summary>
          <div className="goal-columns">
            <GoalList goals={match.goals1 ?? []} />
            <GoalList goals={match.goals2 ?? []} />
          </div>
        </details>
      )}
    </article>
  );
}
