import { teamHash } from "../lib/router";
import { teamFlag, teamName } from "../lib/i18n";

/** Klickbarer Teamname mit Flagge, verlinkt auf die Team-Seite. */
export function TeamLink({
  team,
  flagLast = false,
}: {
  team: string;
  /** Flagge hinter dem Namen (für rechtsbündige Heimteams) */
  flagLast?: boolean;
}) {
  // Platzhalter wie "W101" sind nicht verlinkbar
  if (/^[WL]\d+$/.test(team)) {
    return (
      <>
        {flagLast ? (
          <>
            {teamName(team)} <span className="flag">{teamFlag(team)}</span>
          </>
        ) : (
          <>
            <span className="flag">{teamFlag(team)}</span> {teamName(team)}
          </>
        )}
      </>
    );
  }
  return (
    <a className="team-link" href={teamHash(team)}>
      {flagLast ? (
        <>
          {teamName(team)} <span className="flag">{teamFlag(team)}</span>
        </>
      ) : (
        <>
          <span className="flag">{teamFlag(team)}</span> {teamName(team)}
        </>
      )}
    </a>
  );
}
