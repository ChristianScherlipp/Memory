/**
 * Gemeinsame Typen und Interfaces für das Memory-Spiel.
 * Diese Datei importiert bewusst nichts.
 */

/** Eindeutige ID einer einzelnen Karte. */
export type CardId = number;

/** Symbol-Wert, der ein Kartenpaar identifiziert. */
export type CardSymbol = string;

/** Aktueller Status einer Spielpartie. */
export type GameStatus = "idle" | "running" | "won";

/** Kennung eines der abwechselnd ziehenden Spieler. */
export type PlayerId = 1 | 2 | 3 | 4;

/** Anzahl der an einer Partie beteiligten Spieler. */
export type PlayerCount = 2 | 3 | 4;

/**
 * Ausgang einer beendeten Partie: entweder ein eindeutiger Sieger oder ein
 * Unentschieden (mehrere Spieler mit demselben Höchststand).
 */
export type GameOutcome =
  | { readonly kind: "draw" }
  | { readonly kind: "win"; readonly winner: PlayerId };

/** Eine einzelne Spielkarte. */
export interface Card {
  id: CardId;
  symbol: CardSymbol;
  isFlipped: boolean;
  isMatched: boolean;
  /** Spieler, der das Paar aufgedeckt hat (erst gesetzt, wenn gematcht). */
  matchedBy?: PlayerId;
}

/** Vollständiger Zustand einer Spielpartie. */
export interface GameState {
  cards: Card[];
  status: GameStatus;
  moves: number;
  matchedPairs: number;
  currentPlayer: PlayerId;
  scores: Record<PlayerId, number>;
}

/** Wählbare Spielerfarbe. */
export type PlayerColor = "orange" | "blue" | "green" | "red";

/** Wählbare Spielfeldgröße (Spalten × Zeilen der Beschreibung nach). */
export type BoardSize = "4x4" | "4x6" | "6x6";

/** Kennung einer der optischen Theme-Varianten. */
export type ThemeId = "v1" | "v2" | "v3" | "v4";

/** Vom Nutzer getroffene, vollständige Auswahl vor Spielbeginn. */
export interface GameSettings {
  playerColor: PlayerColor;
  playerCount: PlayerCount;
  boardSize: BoardSize;
  theme: ThemeId;
}

/**
 * Auswahl während des Einstellungsformulars – jedes Feld ist erst gesetzt,
 * sobald der Nutzer die jeweilige Kategorie angeklickt hat.
 */
export type SettingsDraft = Partial<GameSettings>;

/** Bestleistung einer Spielfeldgröße: Zugzahl, Dauer und Datum der Partie. */
export interface RecordEntry {
  moves: number;
  timeMs: number;
  date: string;
}
