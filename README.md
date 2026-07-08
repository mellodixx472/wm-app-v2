# WM 2026 – Turnier-Zusammenfassung ⚽

Eine Web-App, die die FIFA Fussball-Weltmeisterschaft 2026 (USA, Kanada & Mexiko) zusammenfasst:

- **Übersicht** – Live-Countdown zum nächsten Anpfiff, Favoriten-Team, letzte Ergebnisse, nächste Spiele, Kurzstatistiken
- **Gruppen** – berechnete Tabellen aller 12 Gruppen
- **Spiele** – alle 104 Partien mit Tor-Timeline (Spielverlauf), filterbar nach Runde, Gruppe und Team
- **K.o.-Runde** – Turnierbaum vom Sechzehntelfinale bis zum Finale inkl. Spiel um Platz 3
- **Torschützen** – Torschützenliste des Turniers (ohne Eigentore, Elfmeter ausgewiesen)
- **Statistik** – Turnier-Rekorde: torreichste Spiele, Tore je Phase, Eigentore, Elfmeterschießen, Spielorte
- **Tipps** – lokales Tippspiel: Ergebnisse tippen, automatische Auswertung (3/2/1 Punkte)
- **Historie** – Ehrentafel aller Weltmeister seit 1930 und Rekord-Weltmeister
- **Team-Seiten** – Klick auf einen Teamnamen öffnet Turnierweg, Bilanz und Torschützen des Teams; ein Team lässt sich als Favorit markieren

Dazu: teilbare Links für jede Ansicht (`#gruppen`, `#team/Germany`, …), Teilen-Button,
Hell-/Dunkel-Design (folgt initial dem System), automatische Datenaktualisierung
alle 5 Minuten sowie beim Zurückkehren in die App.

## Mobile / PWA

Die App ist für Smartphones optimiert (Bottom-Navigation, gestapelter
K.o.-Baum, kompakte Tabellen) und als **Progressive Web App** installierbar:
über „Zum Home-Bildschirm hinzufügen" landet sie als eigenständige App auf
dem Gerät. Ein Service Worker (`public/sw.js`) cached App-Shell und den
letzten Datenstand, sodass sie auch offline funktioniert.

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

## Android-App (APK)

Die neueste herunterladbare Android-App liegt als GitHub-Release bereit:
<https://github.com/mellodixx472/wm-app-v2/releases/tag/app>

Der Workflow `.github/workflows/android.yml` verpackt die Web-App per
[Capacitor](https://capacitorjs.com/) (Projekt unter `android/`, Web-Assets
offline eingebettet) und aktualisiert das Release bei jedem Push. Die APK ist
Debug-signiert – bei der Installation muss einmalig „unbekannte Quellen"
erlaubt werden. Für iOS steht die PWA-Installation zur Verfügung (siehe oben).

## Deployment

Die App wird automatisch auf **GitHub Pages** veröffentlicht:
<https://mellodixx472.github.io/wm-app-v2/>

Der Workflow `.github/workflows/deploy.yml` baut bei jedem Push (inkl. Tests)
und pusht das Ergebnis auf den `gh-pages`-Branch, von dem GitHub Pages
ausliefert. Dank `base: "./"` in der Vite-Konfiguration funktioniert der
Build unter dem Pages-Unterpfad; Manifest, Icons und Service Worker nutzen
dafür relative Pfade.
