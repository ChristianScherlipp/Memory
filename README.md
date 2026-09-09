# Memory Spiel

Ein klassisches Memory-Spiel (Kartenpaare aufdecken) als Web-App, gebaut mit
**TypeScript**, **SCSS** und **Vite**.

## Projektstruktur

```
Memory/
├── index.html                # Einstiegspunkt / Markup (lädt src/main.ts)
├── src/
│   ├── main.ts               # Einstiegspunkt: initialisiert das Spiel, bindet Events
│   ├── types/
│   │   └── index.ts          # gemeinsame Typen (Card, GameState, GameStatus …)
│   ├── config/
│   │   └── settings.ts       # Konstanten (Symbole, Paaranzahl, Timings, Container-ID)
│   ├── core/                 # Spiel-Logik, kennt kein DOM
│   │   ├── game.ts           # class Game – Zustand & Regeln
│   │   ├── board.ts          # Kartendeck erzeugen & mischen
│   │   └── timer.ts          # class GameTimer
│   ├── ui/                   # DOM & Darstellung
│   │   ├── render.ts         # HTML-Templates für Brett und Karten
│   │   ├── events.ts         # Klick-Handling (Event-Delegation)
│   │   └── dom.ts            # kleine DOM-Helfer
│   ├── utils/
│   │   └── shuffle.ts        # generische Helfer (Fisher-Yates)
│   ├── styles/               # SCSS nach 7-1-Pattern (nur @use / @forward in main.scss)
│   │   ├── main.scss
│   │   ├── abstract/  base/  layout/  components/  pages/  themes/  vendor/
│   └── vite-env.d.ts
├── assets/                   # Bilder, Icons, sonstige Dateien
├── tsconfig.json             # geschützt – nicht verändern
├── package.json              # geschützt – nicht verändern
└── package-lock.json         # geschützt – nicht verändern
```

## Spielidee

- Ein Raster aus verdeckten Karten wird angezeigt.
- Der Spieler deckt zwei Karten auf.
- Zeigen beide Karten dasselbe Symbol, bleiben sie aufgedeckt (ein Paar).
- Zeigen sie unterschiedliche Symbole, werden sie wieder verdeckt.
- Ziel: alle Paare in möglichst wenigen Zügen finden.

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
