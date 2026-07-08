import type { Match } from "../types";
import { computeStandings } from "../lib/standings";
import { groupName } from "../lib/i18n";
import { TeamLink } from "./TeamLink";

export function Groups({ matches }: { matches: Match[] }) {
  const standings = computeStandings(matches);

  return (
    <section>
      <p className="hint">
        Die beiden Gruppenersten sowie die acht besten Gruppendritten erreichten
        das Sechzehntelfinale.
      </p>
      <div className="group-grid">
        {[...standings.entries()].map(([group, rows]) => (
          <table className="group-table" key={group}>
            <caption>{groupName(group)}</caption>
            <thead>
              <tr>
                <th className="pos">#</th>
                <th className="team-col">Team</th>
                <th>Sp</th>
                <th className="wide-only">S</th>
                <th className="wide-only">U</th>
                <th className="wide-only">N</th>
                <th>Tore</th>
                <th>+/−</th>
                <th>Pkt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.team} className={i < 2 ? "qualified" : undefined}>
                  <td className="pos">{i + 1}</td>
                  <td className="team-col">
                    <TeamLink team={row.team} />
                  </td>
                  <td>{row.played}</td>
                  <td className="wide-only">{row.won}</td>
                  <td className="wide-only">{row.drawn}</td>
                  <td className="wide-only">{row.lost}</td>
                  <td>
                    {row.goalsFor}:{row.goalsAgainst}
                  </td>
                  <td>{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
                  <td className="points">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </section>
  );
}
