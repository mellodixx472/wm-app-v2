/** Historisches Team: deutscher Anzeigename, Flagge, optional der
 *  englische openfootball-Name zum Verlinken auf die 2026-Team-Seite. */
export interface HistTeam {
  de: string;
  flag: string;
  en?: string;
}

export interface WorldCupEdition {
  year: number;
  host: string;
  winner: HistTeam;
  runnerUp: HistTeam;
  /** Endergebnis des Finales aus Sicht des Weltmeisters */
  score: string;
  note?: string;
}

const URU: HistTeam = { de: "Uruguay", flag: "🇺🇾", en: "Uruguay" };
const ARG: HistTeam = { de: "Argentinien", flag: "🇦🇷", en: "Argentina" };
const ITA: HistTeam = { de: "Italien", flag: "🇮🇹" };
const CSK: HistTeam = { de: "Tschechoslowakei", flag: "🇨🇿" };
const HUN: HistTeam = { de: "Ungarn", flag: "🇭🇺" };
const GER: HistTeam = { de: "Deutschland", flag: "🇩🇪", en: "Germany" };
const BRA: HistTeam = { de: "Brasilien", flag: "🇧🇷", en: "Brazil" };
const SWE: HistTeam = { de: "Schweden", flag: "🇸🇪", en: "Sweden" };
const ENG: HistTeam = { de: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", en: "England" };
const NED: HistTeam = { de: "Niederlande", flag: "🇳🇱", en: "Netherlands" };
const FRA: HistTeam = { de: "Frankreich", flag: "🇫🇷", en: "France" };
const ESP: HistTeam = { de: "Spanien", flag: "🇪🇸", en: "Spain" };
const CRO: HistTeam = { de: "Kroatien", flag: "🇭🇷", en: "Croatia" };

/** Alle WM-Endrunden 1930–2022 (1942/1946 fielen kriegsbedingt aus). */
export const WORLD_CUP_HISTORY: WorldCupEdition[] = [
  { year: 1930, host: "Uruguay", winner: URU, runnerUp: ARG, score: "4:2" },
  { year: 1934, host: "Italien", winner: ITA, runnerUp: CSK, score: "2:1 n.V." },
  { year: 1938, host: "Frankreich", winner: ITA, runnerUp: HUN, score: "4:2" },
  { year: 1950, host: "Brasilien", winner: URU, runnerUp: BRA, score: "2:1", note: "Entscheidendes Spiel der Finalrunde" },
  { year: 1954, host: "Schweiz", winner: GER, runnerUp: HUN, score: "3:2", note: "Das „Wunder von Bern“" },
  { year: 1958, host: "Schweden", winner: BRA, runnerUp: SWE, score: "5:2" },
  { year: 1962, host: "Chile", winner: BRA, runnerUp: CSK, score: "3:1" },
  { year: 1966, host: "England", winner: ENG, runnerUp: GER, score: "4:2 n.V." },
  { year: 1970, host: "Mexiko", winner: BRA, runnerUp: ITA, score: "4:1" },
  { year: 1974, host: "Deutschland (BR)", winner: GER, runnerUp: NED, score: "2:1" },
  { year: 1978, host: "Argentinien", winner: ARG, runnerUp: NED, score: "3:1 n.V." },
  { year: 1982, host: "Spanien", winner: ITA, runnerUp: GER, score: "3:1" },
  { year: 1986, host: "Mexiko", winner: ARG, runnerUp: GER, score: "3:2" },
  { year: 1990, host: "Italien", winner: GER, runnerUp: ARG, score: "1:0" },
  { year: 1994, host: "USA", winner: BRA, runnerUp: ITA, score: "0:0 (3:2 i.E.)" },
  { year: 1998, host: "Frankreich", winner: FRA, runnerUp: BRA, score: "3:0" },
  { year: 2002, host: "Südkorea & Japan", winner: BRA, runnerUp: GER, score: "2:0" },
  { year: 2006, host: "Deutschland", winner: ITA, runnerUp: FRA, score: "1:1 (5:3 i.E.)" },
  { year: 2010, host: "Südafrika", winner: ESP, runnerUp: NED, score: "1:0 n.V." },
  { year: 2014, host: "Brasilien", winner: GER, runnerUp: ARG, score: "1:0 n.V." },
  { year: 2018, host: "Russland", winner: FRA, runnerUp: CRO, score: "4:2" },
  { year: 2022, host: "Katar", winner: ARG, runnerUp: FRA, score: "3:3 (4:2 i.E.)" },
];

export interface TitleCount {
  team: HistTeam;
  titles: number;
  years: number[];
}

/** Rekord-Weltmeister, absteigend nach Titeln. */
export function titleRanking(): TitleCount[] {
  const acc = new Map<string, TitleCount>();
  for (const edition of WORLD_CUP_HISTORY) {
    let entry = acc.get(edition.winner.de);
    if (!entry) {
      entry = { team: edition.winner, titles: 0, years: [] };
      acc.set(edition.winner.de, entry);
    }
    entry.titles++;
    entry.years.push(edition.year);
  }
  return [...acc.values()].sort(
    (a, b) => b.titles - a.titles || a.team.de.localeCompare(b.team.de),
  );
}
