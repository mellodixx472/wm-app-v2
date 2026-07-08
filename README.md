# WM 2026 – Turnier-Zusammenfassung ⚽

Eine Web-App, die die FIFA Fussball-Weltmeisterschaft 2026 (USA, Kanada & Mexiko) zusammenfasst:

- **Übersicht** – Turnierstatus, letzte Ergebnisse, nächste Spiele, Kurzstatistiken
- **Gruppen** – berechnete Tabellen aller 12 Gruppen
- **Spiele** – alle 104 Partien mit Torschützen, filterbar nach Runde, Gruppe und Team
- **K.o.-Runde** – Turnierbaum vom Sechzehntelfinale bis zum Finale inkl. Spiel um Platz 3
- **Torschützen** – Torschützenliste des Turniers (ohne Eigentore, Elfmeter ausgewiesen)

## Daten

Die App lädt beim Start die aktuellen Turnierdaten von
[openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
(public domain, kein API-Key). Schlägt der Abruf fehl, dient der eingebettete
Snapshot (`src/data/worldcup2026-snapshot.json`) als Offline-Fallback – der
Header zeigt an, welche Quelle aktiv ist. Gruppentabellen, K.o.-Paarungen
(inkl. Auflösung von Platzhaltern wie „Sieger Spiel 95“) und die
Torschützenliste werden clientseitig aus den Rohdaten berechnet.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server (Vite)
npm test         # Unit-Tests (Vitest)
npm run build    # Produktions-Build nach dist/
```

Stack: React 18, TypeScript, Vite, Vitest – keine weiteren Laufzeit-Abhängigkeiten.
