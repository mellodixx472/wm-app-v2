import { useEffect, useMemo, useState } from "react";
import type { DataSource, Tournament } from "./types";
import { loadTournament } from "./lib/data";
import { resolvePlaceholders } from "./lib/knockout";
import { Overview } from "./components/Overview";
import { Groups } from "./components/Groups";
import { Matches } from "./components/Matches";
import { Bracket } from "./components/Bracket";
import { Scorers } from "./components/Scorers";

const TABS = [
  { label: "Übersicht", icon: "🏟️" },
  { label: "Gruppen", icon: "📊" },
  { label: "Spiele", icon: "⚽" },
  { label: "K.o.-Runde", icon: "🏆" },
  { label: "Torschützen", icon: "🥇" },
] as const;

type Tab = (typeof TABS)[number]["label"];

export default function App() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [source, setSource] = useState<DataSource>("snapshot");
  const [tab, setTab] = useState<Tab>("Übersicht");

  useEffect(() => {
    let cancelled = false;
    loadTournament().then((result) => {
      if (cancelled) return;
      setTournament(result.tournament);
      setSource(result.source);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(
    () => (tournament ? resolvePlaceholders(tournament.matches) : []),
    [tournament],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="trophy">🏆</span> WM 2026
        </h1>
        <p className="subtitle">
          FIFA Fussball-Weltmeisterschaft · USA, Kanada &amp; Mexiko ·
          11. Juni – 19. Juli 2026
        </p>
        {tournament && (
          <span
            className={`source-badge ${source}`}
            title={
              source === "live"
                ? "Daten live von openfootball geladen"
                : "Keine Verbindung – eingebauter Datenstand wird angezeigt"
            }
          >
            {source === "live" ? "● Aktuelle Daten" : "○ Offline-Daten"}
          </span>
        )}
      </header>

      <nav className="tabs" aria-label="Ansichten">
        {TABS.map((t) => (
          <button
            key={t.label}
            className={t.label === tab ? "active" : undefined}
            onClick={() => setTab(t.label)}
          >
            <span className="tab-icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main>
        {!tournament && <p className="loading">Lade Turnierdaten …</p>}
        {tournament && tab === "Übersicht" && <Overview matches={matches} />}
        {tournament && tab === "Gruppen" && <Groups matches={matches} />}
        {tournament && tab === "Spiele" && <Matches matches={matches} />}
        {tournament && tab === "K.o.-Runde" && <Bracket matches={matches} />}
        {tournament && tab === "Torschützen" && <Scorers matches={matches} />}
      </main>

      <footer className="app-footer">
        Daten:{" "}
        <a
          href="https://github.com/openfootball/worldcup.json"
          target="_blank"
          rel="noreferrer"
        >
          openfootball/worldcup.json
        </a>{" "}
        (public domain) · Alle Zeiten in deutscher Zeit
      </footer>
    </div>
  );
}
