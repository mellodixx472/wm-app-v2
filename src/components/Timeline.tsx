import type { Goal, Match } from "../types";
import { teamFlag } from "../lib/i18n";

interface TimelineEvent {
  goal: Goal;
  side: 1 | 2;
  sortMinute: number;
}

/** "90+4" → 90.04, "105" → 105 – sortierbar inkl. Nachspielzeit */
function sortableMinute(minute: string): number {
  const m = /^(\d+)(?:\+(\d+))?$/.exec(minute);
  if (!m) return 0;
  return Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0);
}

function goalLabel(goal: Goal): string {
  let label = goal.name;
  if (goal.penalty) label += " (Elfmeter)";
  if (goal.owngoal) label += " (Eigentor)";
  return label;
}

/** Chronologischer Spielverlauf: Tore von team1 links, team2 rechts. */
export function Timeline({ match }: { match: Match }) {
  const events: TimelineEvent[] = [
    ...(match.goals1 ?? []).map<TimelineEvent>((goal) => ({
      goal,
      side: 1,
      sortMinute: sortableMinute(goal.minute),
    })),
    ...(match.goals2 ?? []).map<TimelineEvent>((goal) => ({
      goal,
      side: 2,
      sortMinute: sortableMinute(goal.minute),
    })),
  ].sort((a, b) => a.sortMinute - b.sortMinute);

  if (events.length === 0) return null;

  return (
    <div className="timeline">
      {events.map((event, i) => (
        <div className={`timeline-row side${event.side}`} key={i}>
          <span className="timeline-left">
            {event.side === 1 && (
              <>
                {goalLabel(event.goal)}{" "}
                <span className="flag">{teamFlag(match.team1)}</span>
              </>
            )}
          </span>
          <span className="timeline-minute">{event.goal.minute}&prime;</span>
          <span className="timeline-right">
            {event.side === 2 && (
              <>
                <span className="flag">{teamFlag(match.team2)}</span>{" "}
                {goalLabel(event.goal)}
              </>
            )}
          </span>
        </div>
      ))}
      {match.score?.p && (
        <div className="timeline-row shootout">
          <span className="timeline-left" />
          <span className="timeline-minute">i.E.</span>
          <span className="timeline-right">
            Elfmeterschießen {match.score.p[0]}:{match.score.p[1]}
          </span>
        </div>
      )}
    </div>
  );
}
