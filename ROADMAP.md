# Roadmap: 7 Feature-Vorschläge für Memory

## Context

Sieben Erweiterungsideen für das Memory-Spiel (Rekordseite, Mensch-vs-
Computer mit KI-Schwierigkeitsgraden, mehr als 2 Spieler, Achievements,
Power-Ups, Sounds, farbliche Paar-Kennzeichnung). Dieses Dokument ist der
Umsetzungsplan mit Reihenfolge und Architektur je Punkt.

**Punkt 7 ("aufgedeckte Pärchen farblich kennzeichnen") war bereits vor
diesem Plan implementiert** – `matchBorderStyle`/`lockMatchColor` in
`src/ui/render.ts` und `src/ui/game-view.ts` setzen `--card-border` auf die
Hex-Farbe des Finders, `_card.scss` nutzt das als Rahmenfarbe gematchter
Karten.

Die verbleibenden Punkte unterscheiden sich stark im Aufwand. Das
bestehende Spiel ist fest auf **genau 2 Spieler** zugeschnitten
(`PlayerId = 1 | 2`, `scores: Record<PlayerId, number>`,
`otherPlayerColor()`, Sieg-/Game-Over-/Draw-Templates in `render.ts`).
"Mehr als 2 Spieler" ist damit der invasivste Punkt und kommt **zuletzt**,
weil KI-Gegner und Power-Ups sinnvollerweise erst für das aktuelle
2-Spieler-Modell gebaut und danach auf N Spieler verallgemeinert werden.

## Reihenfolge & Status

| # | Punkt | Status |
|---|-------|--------|
| 1 | Sounds | offen |
| 2 | Rekordseite (Punkte + Zeit) | ✅ erledigt |
| 3 | Achievements | offen |
| 4 | Power-Ups (3er-Serie) | offen |
| 5 | Mensch vs. Computer mit KI-Schwierigkeit | offen |
| 6 | Mehr als 2 Spieler (bis 4) | ✅ erledigt |
| 7 | Farbliche Paar-Kennzeichnung | ✅ war schon vorhanden |

Jeder Punkt ist so beschrieben, dass er für sich funktionsfähig ist – die
Reihenfolge ist eine Empfehlung, keine Zwangsabhängigkeit (außer #6, das
von #5 profitiert, wenn KI vorher existiert).

---

## 1. Sounds

**Ziel:** Ton bei Aufdecken, Gewinn, Verlust.

- Neue Assets: `public/assets/audio/flip.mp3`, `win.mp3`, `lose.mp3` (oder
  `.ogg`) – **müssen vom Nutzer geliefert werden**, Audiodateien können
  nicht automatisch erzeugt werden.
- Neues Modul `src/core/audio.ts`: kleine Wrapper-Funktion `playSound(name)`
  um `new Audio(assetUrl(...))`, analog zu `assetUrl()` aus
  `config/settings.ts`. Config-Konstante `SOUND_BASE_PATH` +
  `SOUND_FILES: Record<SoundName, string>`.
- Verdrahtung in `src/main.ts`: `playSound("flip")` in `handleCardClick`
  bei erfolgreichem `flip()`, `playSound("win"/"lose"/"draw")` in
  `maybeShowEnd()` je nach `GameOutcome`.
- Kein Mute-Schalter im Scope, da nicht angefragt (kann später als eigener
  Punkt ergänzt werden).

## 2. Rekordseite (Punkte + Zeit) ✅

**Ziel:** Bestleistungen (wenigste Züge, schnellste Zeit) je Spielfeldgröße
persistent anzeigen.

**Umgesetzt wie folgt:**

- Zeitmessung in `src/main.ts`: `turnStartedAt` wird beim ersten
  erfolgreichen `flip()` gesetzt, bei Spielstart (`startGame()`)
  zurückgesetzt.
- `src/core/records-store.ts` (Muster wie `settings-store.ts`):
  `RecordEntry { moves, timeMs, date }`, `loadRecords()`/`recordResult()`
  unter `localStorage`-Key `memory:records`, pro `BoardSize` das beste
  Ergebnis (weniger Züge, bei Gleichstand kürzere Zeit).
- Neue Seite `#page-records` in `index.html`, neue IDs in
  `config/settings.ts` (`RECORDS_PAGE_ID`, `RECORDS_CONTAINER_ID`,
  `VIEW_RECORDS_BUTTON_ID`, `BACK_FROM_RECORDS_BUTTON_ID`). Erreichbar über
  den "Records"-Button auf der Startseite.
- `src/ui/records.ts` mit `renderRecords(records)` – Liste je
  Spielfeldgröße mit Zügen + Zeit (`M:SS`), "No round played yet" als
  Leerzustand.
- `main.ts`: nach Spielende `trackRecord(...)` aufgerufen, das
  `recordResult(...)` prüft und bei neuem Rekord die Liste neu zeichnet.

## 3. Achievements

**Ziel:** Freischaltbare Erfolge (z. B. "in ≤ 10 Zügen gewonnen"),
persistent, Anzeige auf der Settings-Seite.

- Neues Modul `src/config/achievements.ts`: Katalog als
  `ACHIEVEMENTS: readonly AchievementSpec[]` mit `id`, `label`,
  `description`, und einer reinen Prüf-Funktion
  `isUnlocked(outcome, state, settings): boolean` (bekommt dieselben Daten
  wie `maybeShowEnd()`).
- Neuer Store `src/core/achievements-store.ts` (Muster wie
  `settings-store.ts`): `Set<AchievementId>` unter eigenem
  `localStorage`-Key (`memory:achievements`), `loadUnlocked()`,
  `unlock(id)`.
- `main.ts`: in `maybeShowEnd()` nach Spielende alle `ACHIEVEMENTS` gegen
  den aktuellen Ausgang prüfen und neu erreichte freischalten.
- UI: `src/ui/settings.ts` (oder eigenes `src/ui/achievements.ts`,
  eingebunden in die Settings-Seite) rendert eine Liste aller Achievements,
  freigeschaltete hervorgehoben/mit Datum, gesperrte ausgegraut mit
  Beschreibung.

## 4. Power-Ups (3 Treffer in Folge)

**Ziel:** Bei 3 aufeinanderfolgenden Treffern eines Spielers erhält dieser
ein Power-Up (z. B. "alle Karten kurz aufdecken", "gegnerischen Zug
überspringen").

- `Game` (`src/core/game.ts`) bekommt einen Streak-Zähler pro Spieler
  (`consecutiveMatches: Record<PlayerId, number>` im `GameState`,
  hochgezählt in `resolveTurn()` bei Treffer, zurückgesetzt bei Fehlversuch
  oder Spielerwechsel) und einen Vorrat an Power-Ups
  (`powerUps: Record<PlayerId, PowerUpType[]>`), befüllt sobald der Streak
  3 erreicht (und danach zurückgesetzt, damit alle 3 Treffer erneut ein
  Power-Up gibt).
- Neuer Typ `PowerUpType = "peek" | "skip-turn"` in `types/index.ts`.
- Neue `Game`-Methoden: `usePowerUp(player, type)` – `"peek"` deckt alle
  nicht gematchten Karten kurz auf (neuer `GameState`-Flag `peeking:
  boolean`, `main.ts` blendet ihn nach `FLIP_BACK_DELAY_MS`-artiger
  Verzögerung wieder aus, ähnlich dem bestehenden
  `scheduleTurnResolution`-Muster); `"skip-turn"` setzt einen
  `skipNextTurn`-Flag, den `switchPlayer()` beim nächsten Aufruf
  konsumiert.
- UI: `render.ts`/`game-view.ts` – neuer Bereich in der Spielleiste zeigt
  verfügbare Power-Ups des aktiven Spielers als Buttons; Klick-Handling
  über das bestehende Event-Delegation-Muster (`bindDelegatedButton` in
  `main.ts`).

## 5. Mensch vs. Computer mit KI-Schwierigkeit

**Ziel:** Spielmodus-Auswahl (Mensch/Computer) in den Settings, KI mit vier
Schwierigkeitsstufen und unterschiedlichem "Gedächtnis".

- Settings-Erweiterung: neue Gruppe `opponent: "human" | "computer"` und
  bei `"computer"` zusätzlich `difficulty: "easy" | "medium" | "hard" |
  "hardcore"` in `GameSettings`/`SettingsDraft` (`types/index.ts`), neue
  `GroupSpec`-Einträge in `ui/settings.ts` (bedingt sichtbar: Difficulty-
  Gruppe nur rendern, wenn `opponent === "computer"`), Persistenz über den
  bestehenden `settings-store.ts`.
- Neues Modul `src/core/ai.ts`: reine Funktion(en), kein DOM-Zugriff
  (analog zu `game.ts`). Zentrale Typen:
  - `AiMemory`: welche `CardId`→`symbol`-Zuordnungen die KI kennt.
    Aufgebaut aus der Zug-Historie, die `main.ts` ohnehin beobachtet
    (jeder `flip()`-Aufruf liefert Symbol+ID).
  - Unterschied schwer/hardcore: **schwer** merkt sich nur Karten, die die
    KI selbst aufgedeckt hat; **hardcore** merkt sich alle von *beiden*
    Spielern aufgedeckten Karten. Damit braucht `main.ts` (oder ein neuer
    Hook in `Game`) ein Ereignis "Karte X wurde von Spieler Y aufgedeckt",
    das die KI-Gedächtnis-Instanz je nach Schwierigkeit füttert oder
    ignoriert.
  - `chooseMove(memory, state, difficulty): CardId` – bei bekanntem Paar
    spielt die KI es (mit einer je nach Stufe unterschiedlichen
    Fehlerwahrscheinlichkeit: leicht = macht auch bekannte Paare oft nicht/
    wählt zufällig, mittel = kleine Fehlerquote, schwer/hardcore = spielt
    bekannte Paare praktisch immer korrekt), sonst zufällige unaufgedeckte
    Karte.
- Verdrahtung in `main.ts`: nach jedem `draw()` prüfen, ob
  `state.currentPlayer === 2 && settings.opponent === "computer" &&
  !game.hasPendingTurn()` – wenn ja, nach kurzer Verzögerung (Timer, analog
  `scheduleTurnResolution`) `ai.chooseMove(...)` aufrufen und über denselben
  `handleCardClick`-Pfad wie einen echten Klick verarbeiten (kein
  Sonderpfad in `Game` nötig).
- UI: Spielleiste zeigt "Computer" statt "Player 2" (Label-Anpassung in
  `render.ts`), keine Karten-Klicks für Spieler 2 möglich, solange die KI
  am Zug ist (Guard in `handleCardClick`).

## 6. Mehr als 2 Spieler (bis zu 4) ✅

**Ziel:** 2–4 Spieler statt fest 2, zwei neue Farben (Grün, Rot).

**Umgesetzt wie folgt:**

- `types/index.ts`: `PlayerId = 1 | 2 | 3 | 4`, `PlayerCount = 2 | 3 | 4`,
  `PlayerColor` um `green`/`red` erweitert, `GameSettings` bekommt
  `playerCount`. `GameOutcome` wurde von der String-Union
  `"player-1-wins" | "player-2-wins" | "draw"` zu einem strukturierten Typ
  (`{ kind: "draw" } | { kind: "win"; winner: PlayerId }`), da sich der
  Sieger bei N Spielern nicht mehr sauber in eine feste String-Union packen
  lässt.
- `config/settings.ts`: `PLAYER_COLORS` um Grün/Rot erweitert;
  `otherPlayerColor()` ersetzt durch `assignPlayerColors(primary, count)`
  (Spieler 1 wählt seine Farbe, die übrigen bekommen die restlichen Farben
  in fester Reihenfolge Orange → Blau → Grün → Rot) und `playerIds(count)`
  als zentrale Quelle für alle Schleifen über aktive Spieler.
  `THEMED_PLAYER_COLORS`/`hasThemedFigure()` steuern den Asset-Fallback
  (s. u.).
- `core/game.ts`: Konstruktor nimmt zusätzlich `playerCount` entgegen;
  `switchPlayer()` läuft reihum per Modulo; `getWinner()` ermittelt den
  höchsten Score unter allen aktiven Spielern (mehrere Führende ⇒
  weiterhin `undefined` = Unentschieden); `scores` wird immer für alle 4
  `PlayerId`-Werte initialisiert (ungenutzte Spieler bleiben bei 0).
- `ui/settings.ts`: neue Gruppe "Number of players" (2/3/4) zwischen Theme
  und Spielerfarbe; Vorschau-Beschriftung unter dem Vorschaubild hat jetzt
  ein viertes Wort ("Players" → "3 players" etc.).
- `ui/render.ts`: Scoreboard- und Endstand-Listen laufen über
  `playerIds(settings.playerCount)` statt hartkodierter Spieler 1/2;
  Sieg-/Game-Over-/Draw-Screens generalisiert (Game-Over zeigt jetzt, wer
  gewonnen hat + alle Endstände; Draw zeigt zusätzlich die Endstände, da
  ein Unentschieden jetzt auch "2 von 4 gleichauf vorne" bedeuten kann).
- **Asset-Fallback:** Themenspezifische Sieg-/Scoreboard-Grafiken
  existieren nur für Orange/Blau. Für Grün/Rot (und Theme v1 generell)
  wird das generische, per CSS-Maske einfärbbare `player_icon.svg` genutzt
  (`renderPlayerFigure()` in `render.ts`, geteilt zwischen kleinem
  Scoreboard-Icon und großem Sieg-Bild).

---

## Verifikation je Punkt

- Nach jeder Umsetzung: `npx tsc --noEmit -p tsconfig.json` und
  `npx vite build` (wie bisher im Projekt üblich).
- Manuelle Prüfung über `npm run dev` im Browser: neue Formular-Gruppen,
  Sounds, Power-Up-Buttons, Rekord-/Achievement-Anzeige jeweils durchklicken.
- Bei #5/#6 zusätzlich mehrere komplette Partien spielen, um Edge Cases
  (Gleichstand bei 3+ Spielern, KI-Endlosschleifen, Power-Up-Reset bei
  Spielerwechsel) zu prüfen.

## Nächster Schritt

Weiter mit Punkt 3 (Achievements) oder Punkt 1 (Sounds, benötigt vorab
Audio-Dateien vom Nutzer).
