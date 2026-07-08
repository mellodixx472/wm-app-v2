import { useCallback, useEffect, useMemo, useState } from "react";
import type { DataSource, Tournament } from "./types";
import { loadTournament } from "./lib/data";
import { resolvePlaceholders } from "./lib/knockout";
import { useRoute, type TabRoute } from "./lib/router";
import { loadJson, saveJson } from "./lib/storage";
import { Overview } from "./components/Overview";
import { Groups } from "./components/Groups";
import { Matches } from "./components/Matches";
import { Bracket } from "./components/Bracket";
import { Scorers } from "./components/Scorers";
import { Stats } from "./components/Stats";
import { Tips } from "./components/Tips";
import { History } from "./components/History";
import { TeamPage } from "./components/TeamPage";

const TABS: Array<{ route: TabRoute; label: string; icon: string }> = [
  { route: "uebersicht", label: "Übersicht", icon: "🏟️" },
  { route: "gruppen", label: "Gruppen", icon: "📊" },
  { route: "spiele", label: "Spiele", icon: "⚽" },
  { route: "ko", label: "K.o.-Runde", icon: "🏆" },
  { route: "torschuetzen", label: "Torschützen", icon: "🥇" },
  { route: "statistik", label: "Statistik", icon: "📈" },
  { route: "tipps", label: "Tipps", icon: "🎯" },
  { route: "historie", label: "Historie", icon: "📜" },
];

type Theme = "dark" | "light";

const THEME_COLORS: Record<Theme, string> = {
  dark: "#0d1420",
  light: "#f2f5f9",
};

function initialTheme(): Theme {
  const stored = loadJson<Theme | null>("theme", null);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function App() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [source, setSource] = useState<DataSource>("snapshot");
  const [route, navigate] = useRoute();
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [shared, setShared] = useState(false);

  const refresh = useCallback((force: boolean) => {
    loadTournament().then((result) => {
      // Beim Auto-Refresh nie Live-Daten durch den älteren Snapshot ersetzen
      setTournament((current) =>
        force || current === null || result.source === "live"
          ? result.tournament
          : current,
      );
      setSource((current) =>
        force || result.source === "live" ? result.source : current,
      );
    });
  }, []);

  useEffect(() => {
    refresh(true);
    const interval = setInterval(() => refresh(false), REFRESH_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveJson("theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      throw new Error("no share api");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // weder Share noch Clipboard verfügbar
      }
    }
  };

  const matches = useMemo(
    () => (tournament ? resolvePlaceholders(tournament.matches) : []),
    [tournament],
  );

  const activeTab = route.kind === "tab" ? route.tab : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={share}
            title="Diese Ansicht teilen"
          >
            {shared ? "✅" : "📤"}
          </button>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Helles Design" : "Dunkles Design"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
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
            key={t.route}
            className={t.route === activeTab ? "active" : undefined}
            onClick={() => navigate(`#${t.route}`)}
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
        {tournament && route.kind === "team" && (
          <TeamPage team={route.team} matches={matches} />
        )}
        {tournament && activeTab === "uebersicht" && (
          <Overview matches={matches} />
        )}
        {tournament && activeTab === "gruppen" && <Groups matches={matches} />}
        {tournament && activeTab === "spiele" && <Matches matches={matches} />}
        {tournament && activeTab === "ko" && <Bracket matches={matches} />}
        {tournament && activeTab === "torschuetzen" && (
          <Scorers matches={matches} />
        )}
        {tournament && activeTab === "statistik" && <Stats matches={matches} />}
        {tournament && activeTab === "tipps" && <Tips matches={matches} />}
        {tournament && activeTab === "historie" && (
          <History matches={matches} />
        )}
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
