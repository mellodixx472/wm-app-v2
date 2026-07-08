import { useMemo, useState } from "react";
import type { Match } from "../types";
import { KO_ROUNDS } from "../lib/knockout";
import { groupName, matchDate, roundName, teamName } from "../lib/i18n";
import { MatchCard } from "./MatchCard";

const GROUP_STAGE = "Gruppenphase";

export function Matches({ matches }: { matches: Match[] }) {
  const [round, setRound] = useState("");
  const [group, setGroup] = useState("");
  const [team, setTeam] = useState("");

  const groups = useMemo(
    () => [...new Set(matches.map((m) => m.group).filter(Boolean))].sort(),
    [matches],
  ) as string[];
  const teams = useMemo(
    () =>
      [...new Set(matches.filter((m) => m.group).flatMap((m) => [m.team1, m.team2]))].sort(
        (a, b) => teamName(a).localeCompare(teamName(b)),
      ),
    [matches],
  );

  const filtered = matches
    .filter((m) => {
      if (round === GROUP_STAGE && !m.group) return false;
      if (round && round !== GROUP_STAGE && m.round !== round) return false;
      if (group && m.group !== group) return false;
      if (team && m.team1 !== team && m.team2 !== team) return false;
      return true;
    })
    .sort((a, b) => matchDate(a).getTime() - matchDate(b).getTime());

  return (
    <section>
      <div className="filters">
        <label>
          Runde{" "}
          <select value={round} onChange={(e) => setRound(e.target.value)}>
            <option value="">Alle</option>
            <option value={GROUP_STAGE}>{GROUP_STAGE}</option>
            {KO_ROUNDS.map((r) => (
              <option key={r} value={r}>
                {roundName(r)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Gruppe{" "}
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Alle</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {groupName(g)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Team{" "}
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Alle</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {teamName(t)}
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count">{filtered.length} Spiele</span>
      </div>
      <div className="match-list">
        {filtered.map((m, i) => (
          <MatchCard key={m.num ?? `${m.date}-${i}`} match={m} />
        ))}
      </div>
    </section>
  );
}
