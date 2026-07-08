import type { Match } from "../types";
import { computeScorers } from "../lib/scorers";
import { TeamLink } from "./TeamLink";

const TOP_N = 25;

export function Scorers({ matches }: { matches: Match[] }) {
  const scorers = computeScorers(matches);
  const shown = scorers.slice(0, TOP_N);

  return (
    <section>
      <table className="scorer-table">
        <caption>
          Torschützenliste (Top {shown.length} von {scorers.length}, ohne
          Eigentore)
        </caption>
        <thead>
          <tr>
            <th className="pos">#</th>
            <th className="team-col">Spieler</th>
            <th className="team-col">Team</th>
            <th>Tore</th>
            <th title="davon Elfmeter">Elfm.</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={`${row.name}|${row.team}`}>
              <td className="pos">
                {i > 0 && row.goals === shown[i - 1].goals ? "" : i + 1}
              </td>
              <td className="team-col">{row.name}</td>
              <td className="team-col">
                <TeamLink team={row.team} />
              </td>
              <td className="points">{row.goals}</td>
              <td>{row.penalties || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
