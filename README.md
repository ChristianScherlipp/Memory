# Memory Spiel

Ein klassisches Memory-Spiel (Kartenpaare aufdecken) als einfache Web-App mit
HTML, CSS und JavaScript – ohne Build-Tools oder Frameworks.

## Projektstruktur

```
Memory/
├── index.html          # Einstiegspunkt / Markup des Spiels
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── script.js       # Spiellogik
├── assets/             # Bilder, Icons, sonstige Dateien
├── .gitignore
└── README.md
```

## Spielidee

- Ein Raster aus verdeckten Karten wird angezeigt.
- Der Spieler deckt zwei Karten auf.
- Zeigen beide Karten dasselbe Symbol, bleiben sie aufgedeckt (ein Paar).
- Zeigen sie unterschiedliche Symbole, werden sie wieder verdeckt.
- Ziel: alle Paare in möglichst wenigen Zügen finden.

## Starten

Da es sich um eine reine statische Seite handelt, reicht es, `index.html` in
einem Browser zu öffnen. Alternativ lässt sich ein lokaler Webserver nutzen:

```bash
# mit Python
python -m http.server 8000

# oder mit Node.js (npx)
npx serve .
```

Danach im Browser aufrufen: <http://localhost:8000>
