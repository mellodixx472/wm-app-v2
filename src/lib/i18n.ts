import type { Match } from "../types";

interface TeamInfo {
  de: string;
  flag: string;
}

const TEAMS: Record<string, TeamInfo> = {
  Algeria: { de: "Algerien", flag: "🇩🇿" },
  Argentina: { de: "Argentinien", flag: "🇦🇷" },
  Australia: { de: "Australien", flag: "🇦🇺" },
  Austria: { de: "Österreich", flag: "🇦🇹" },
  Belgium: { de: "Belgien", flag: "🇧🇪" },
  "Bosnia & Herzegovina": { de: "Bosnien-Herzegowina", flag: "🇧🇦" },
  Brazil: { de: "Brasilien", flag: "🇧🇷" },
  Canada: { de: "Kanada", flag: "🇨🇦" },
  "Cape Verde": { de: "Kap Verde", flag: "🇨🇻" },
  Colombia: { de: "Kolumbien", flag: "🇨🇴" },
  Croatia: { de: "Kroatien", flag: "🇭🇷" },
  Curaçao: { de: "Curaçao", flag: "🇨🇼" },
  "Czech Republic": { de: "Tschechien", flag: "🇨🇿" },
  "DR Congo": { de: "DR Kongo", flag: "🇨🇩" },
  Ecuador: { de: "Ecuador", flag: "🇪🇨" },
  Egypt: { de: "Ägypten", flag: "🇪🇬" },
  England: { de: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  France: { de: "Frankreich", flag: "🇫🇷" },
  Germany: { de: "Deutschland", flag: "🇩🇪" },
  Ghana: { de: "Ghana", flag: "🇬🇭" },
  Haiti: { de: "Haiti", flag: "🇭🇹" },
  Iran: { de: "Iran", flag: "🇮🇷" },
  Iraq: { de: "Irak", flag: "🇮🇶" },
  "Ivory Coast": { de: "Elfenbeinküste", flag: "🇨🇮" },
  Japan: { de: "Japan", flag: "🇯🇵" },
  Jordan: { de: "Jordanien", flag: "🇯🇴" },
  Mexico: { de: "Mexiko", flag: "🇲🇽" },
  Morocco: { de: "Marokko", flag: "🇲🇦" },
  Netherlands: { de: "Niederlande", flag: "🇳🇱" },
  "New Zealand": { de: "Neuseeland", flag: "🇳🇿" },
  Norway: { de: "Norwegen", flag: "🇳🇴" },
  Panama: { de: "Panama", flag: "🇵🇦" },
  Paraguay: { de: "Paraguay", flag: "🇵🇾" },
  Portugal: { de: "Portugal", flag: "🇵🇹" },
  Qatar: { de: "Katar", flag: "🇶🇦" },
  "Saudi Arabia": { de: "Saudi-Arabien", flag: "🇸🇦" },
  Scotland: { de: "Schottland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  Senegal: { de: "Senegal", flag: "🇸🇳" },
  "South Africa": { de: "Südafrika", flag: "🇿🇦" },
  "South Korea": { de: "Südkorea", flag: "🇰🇷" },
  Spain: { de: "Spanien", flag: "🇪🇸" },
  Sweden: { de: "Schweden", flag: "🇸🇪" },
  Switzerland: { de: "Schweiz", flag: "🇨🇭" },
  Tunisia: { de: "Tunesien", flag: "🇹🇳" },
  Turkey: { de: "Türkei", flag: "🇹🇷" },
  USA: { de: "USA", flag: "🇺🇸" },
  Uruguay: { de: "Uruguay", flag: "🇺🇾" },
  Uzbekistan: { de: "Usbekistan", flag: "🇺🇿" },
};

const ROUNDS: Record<string, string> = {
  "Round of 32": "Sechzehntelfinale",
  "Round of 16": "Achtelfinale",
  "Quarter-final": "Viertelfinale",
  "Semi-final": "Halbfinale",
  "Match for third place": "Spiel um Platz 3",
  Final: "Finale",
};

const PLACEHOLDER = /^([WL])(\d+)$/;

export function teamName(name: string): string {
  const m = PLACEHOLDER.exec(name);
  if (m) {
    return `${m[1] === "W" ? "Sieger" : "Verlierer"} Spiel ${m[2]}`;
  }
  return TEAMS[name]?.de ?? name;
}

export function teamFlag(name: string): string {
  return TEAMS[name]?.flag ?? "⚽";
}

export function roundName(round: string): string {
  const matchday = /^Matchday (\d+)$/.exec(round);
  if (matchday) return `${matchday[1]}. Spieltag`;
  return ROUNDS[round] ?? round;
}

export function groupName(group: string): string {
  return group.replace(/^Group /, "Gruppe ");
}

/** "2026-06-11" + "13:00 UTC-6" → Date (Ortszeit des Stadions als fester Offset) */
export function matchDate(match: Match): Date {
  const time = /^(\d{2}:\d{2}) UTC([+-]\d+)$/.exec(match.time ?? "");
  if (time) {
    const offset = `${time[2].charAt(0)}${time[2].slice(1).padStart(2, "0")}:00`;
    return new Date(`${match.date}T${time[1]}:00${offset}`);
  }
  return new Date(`${match.date}T12:00:00Z`);
}

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMatchDate(match: Match): string {
  return dateFmt.format(matchDate(match));
}

/** Anstoß in deutscher Zeit (MESZ) */
export function formatMatchDateTime(match: Match): string {
  return `${dateTimeFmt.format(matchDate(match))} Uhr`;
}
