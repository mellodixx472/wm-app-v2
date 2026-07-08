import type { Match } from "../types";
import { finalScore, winner } from "../lib/knockout";
import { teamHash } from "../lib/router";
import { teamFlag, teamName } from "../lib/i18n";
import {
  titleRanking,
  WORLD_CUP_HISTORY,
  type HistTeam,
} from "../data/history";

function HistTeamLabel({
  team,
  teams2026,
}: {
  team: HistTeam;
  teams2026: Set<string>;
}) {
  const label = (
    <>
      <span className="flag">{team.flag}</span> {team.de}
    </>
  );
  if (team.en && teams2026.has(team.en)) {
    return (
      <a className="team-link" href={teamHash(team.en)}>
        {label}
      </a>
    );
  }
  return label;
}

export function History({ matches }: { matches: Match[] }) {
  const teams2026 = new Set(
    matches
      .filter((m) => m.group)
      .flatMap((m) => [m.team1, m.team2]),
  );
  const ranking = titleRanking();

  const final2026 = matches.find((m) => m.round === "Final");
  const champion2026 = final2026 ? winner(final2026) : null;

  return (
    <section>
      <h2 className="centered-heading">Rekord-Weltmeister</h2>
      <div className="stat-grid">
        {ranking.slice(0, 4).map((entry) => (
          <div className="stat-tile" key={entry.team.de}>
            <span className="stat-value">
              <span className="flag">{entry.team.flag}</span> {entry.team.de}{" "}
              <small>{"★".repeat(entry.titles)}</small>
            </span>
            <span className="stat-label">
              {entry.titles} Titel · {entry.years.join(", ")}
            </span>
          </div>
        ))}
      </div>
      <p className="hint">
        {ranking
          .slice(4)
          .map((e) => `${e.team.de} ${e.titles}×`)
          .join(" · ")}
      </p>

      <h2 className="centered-heading">Alle Weltmeisterschaften</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Jahr</th>
            <th className="team-col">Gastgeber</th>
            <th className="team-col">Weltmeister</th>
            <th>Finale</th>
            <th className="team-col">Finalgegner</th>
          </tr>
        </thead>
        <tbody>
          <tr className="current-edition">
            <td>2026</td>
            <td className="team-col">USA, Kanada &amp; Mexiko</td>
            {champion2026 && final2026?.score ? (
              <>
                <td className="team-col">
                  <HistTeamLabel
                    team={{
                      de: teamName(champion2026),
                      flag: teamFlag(champion2026),
                      en: champion2026,
                    }}
                    teams2026={teams2026}
                  />
                </td>
                <td>
                  {finalScore(final2026.score).join(":")}
                  {final2026.score.p &&
                    ` (${final2026.score.p.join(":")} i.E.)`}
                  {!final2026.score.p && final2026.score.et && " n.V."}
                </td>
                <td className="team-col">
                  <HistTeamLabel
                    team={{
                      de: teamName(
                        champion2026 === final2026.team1
                          ? final2026.team2
                          : final2026.team1,
                      ),
                      flag: teamFlag(
                        champion2026 === final2026.team1
                          ? final2026.team2
                          : final2026.team1,
                      ),
                      en:
                        champion2026 === final2026.team1
                          ? final2026.team2
                          : final2026.team1,
                    }}
                    teams2026={teams2026}
                  />
                </td>
              </>
            ) : (
              <td className="team-col" colSpan={3}>
                <em>Wird gerade ausgespielt … 🏆</em>
              </td>
            )}
          </tr>
          {[...WORLD_CUP_HISTORY].reverse().map((e) => (
            <tr key={e.year}>
              <td>{e.year}</td>
              <td className="team-col">{e.host}</td>
              <td className="team-col winner-col">
                <HistTeamLabel team={e.winner} teams2026={teams2026} />
              </td>
              <td title={e.note}>{e.score}</td>
              <td className="team-col">
                <HistTeamLabel team={e.runnerUp} teams2026={teams2026} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        1942 und 1946 fanden kriegsbedingt keine Weltmeisterschaften statt.
        1930–1990: Deutschland = BR Deutschland.
      </p>
    </section>
  );
}
