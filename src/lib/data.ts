import type { DataSource, Tournament } from "../types";
import snapshot from "../data/worldcup2026-snapshot.json";

const LIVE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

function isTournament(data: unknown): data is Tournament {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as Tournament).matches) &&
    (data as Tournament).matches.length > 0
  );
}

/**
 * Lädt die aktuellen Turnierdaten von openfootball (public domain, kein API-Key).
 * Schlägt der Abruf fehl, dient der eingebettete Snapshot als Offline-Fallback.
 */
export async function loadTournament(): Promise<{
  tournament: Tournament;
  source: DataSource;
}> {
  try {
    const response = await fetch(LIVE_URL, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!isTournament(data)) throw new Error("Unerwartetes Datenformat");
    return { tournament: data, source: "live" };
  } catch {
    return { tournament: snapshot as Tournament, source: "snapshot" };
  }
}
