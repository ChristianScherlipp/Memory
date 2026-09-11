# Memory Spiel

Ein Memory-Spiel für zwei Spieler (Kartenpaare aufdecken) als Web-App,
gebaut mit **TypeScript**, **SCSS** und **Vite**.

## Features

- **2-Spieler-Modus**: Spieler wechseln sich ab, Punktestand pro Spieler,
  Sieg-/Unentschieden-Ermittlung am Ende.
- **Einstellungen** vor Spielstart: Spielerfarbe (Orange/Blau), Spielfeld-
  größe (4×4, 4×6, 6×6) und optisches Theme – inklusive Live-Vorschau.
  Auswahl wird in `localStorage` gespeichert.
- **4 Theme-Varianten** (`v1`–`v4`), je mit eigenen Karten-, Sieg- und
  Spielleisten-Bildern sowie eigenen Akzentfarben: `code_vibes_theme`,
  `games_theme_cards`, `da_projects_theme`, `food_theme` (eigene Schriftart
  „Klee One“).
- **Spielleiste** oberhalb des Bretts: Punktestand, aktueller Spieler und
  Exit-Button, alle farblich an das gewählte Theme angepasst; bleibt beim
  Scrollen oben sichtbar (sticky).
- **Exit-Bestätigung** per Dialog, bevor der laufende Spielstand verworfen
  wird.
- Karten-Flip per 3D-Animation, ohne das Brett neu zu rendern.
- Durchgängig responsive von 320 px bis 1440 px Breite.

## Projektstruktur

```
Memory/
├── index.html                 # Einstiegspunkt / Markup (lädt src/main.ts)
├── vite.config.ts             # Vite-Konfiguration (u. a. `base`-Pfad)
├── src/
│   ├── main.ts                # Einstiegspunkt: verbindet Logik, UI und Events
│   ├── types/
│   │   └── index.ts           # gemeinsame Typen (Card, GameState, GameSettings …)
│   ├── config/
│   │   └── settings.ts        # Konstanten (Symbole, Farben, Pfade, DOM-IDs …)
│   ├── core/                  # Spiel-Logik, kennt kein DOM
│   │   ├── game.ts            # Zustand & Regeln einer Partie
│   │   ├── board.ts           # Kartendeck erzeugen & mischen
│   │   ├── timer.ts           # einfacher Spiel-Timer
│   │   └── settings-store.ts  # Laden/Speichern der Auswahl in localStorage
│   ├── ui/                    # DOM & Darstellung
│   │   ├── render.ts          # HTML-Templates (Spielleiste, Brett, Karten, End-Screen)
│   │   ├── settings.ts        # Einstellungsformular inkl. Live-Vorschau
│   │   ├── game-view.ts       # verknüpft Spielzustand mit dem DOM (gezielte Updates)
│   │   ├── events.ts          # Klick-Handling (Event-Delegation)
│   │   ├── navigation.ts      # Ein-/Ausblenden der `.page`-Sektionen
│   │   ├── theme.ts           # setzt `data-theme`/`data-player` auf `<html>`
│   │   └── dom.ts             # kleine DOM-Helfer
│   ├── utils/
│   │   └── shuffle.ts         # Fisher-Yates-Shuffle
│   ├── styles/                # SCSS nach 7-1-Pattern (nur @use/@forward in main.scss)
│   │   ├── main.scss
│   │   ├── abstract/           # Variablen, Funktionen, Mixins
│   │   ├── base/                # Reset, Typografie, Basis-Elemente
│   │   ├── components/          # Button, Karte, Spielleiste, End-Screen, Modal
│   │   ├── pages/                # Start-, Settings- und allgemeine Seiten-Styles
│   │   └── themes/               # Theme-Varianten & Farbschemata (CSS-Custom-Properties)
│   └── vite-env.d.ts
├── public/                    # statische Assets (unverändert kopiert)
│   └── assets/
│       ├── fonts/              # Almarai, Red Rose, Klee One
│       ├── icons/               # UI-Icons, inkl. game_icons/ (Exit, Spieler)
│       └── img/                  # front/ (Kartenmotive je Theme), game_end/, settings/
├── tsconfig.json              # geschützt – nicht verändern
├── package.json               # geschützt – nicht verändern
└── package-lock.json          # geschützt – nicht verändern
```

## Spielidee

- Vor dem Start wählen die Spieler Farbe, Spielfeldgröße und Theme.
- Ein Raster aus verdeckten Karten wird angezeigt; Spieler 1 beginnt.
- Der aktive Spieler deckt zwei Karten auf.
- Zeigen beide Karten dasselbe Symbol, bleiben sie aufgedeckt (Punkt für
  den aktiven Spieler) und derselbe Spieler ist erneut am Zug.
- Zeigen sie unterschiedliche Symbole, werden sie wieder verdeckt und der
  andere Spieler ist am Zug.
- Sind alle Paare gefunden, gewinnt, wer mehr Paare hat (oder Unentschieden).

## Entwicklung

```bash
npm run dev       # Vite-Dev-Server mit Hot Reload
npm run build     # Typprüfung (tsc --noEmit) + Produktions-Build nach dist/
npm run preview   # den erzeugten Build lokal ansehen
```

## Code-Konventionen

- Dateinamen in kebab-case; Funktionen camelCase, Klassen/Interfaces/Typen
  PascalCase, Konstanten UPPER_CASE.
- Kein `any` (exakter Typ oder `unknown`), Parameter- und Rückgabetypen explizit.
- Semikolons, 2 Leerzeichen Einrückung, Imports gruppiert (Std → Dritt → lokal).
- TSDoc über jeder Funktion/Methode; max. 14 Zeilen pro Funktion; keine Magic
  Numbers; HTML nur in `ui/render.ts`.
- SCSS: keine Magic Numbers/Farben – zentral in `abstract/_variables.scss`
  bzw. als CSS-Custom-Property je Theme in `themes/_variants.scss` benennen.
