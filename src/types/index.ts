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

/** Kennung eines der beiden abwechselnd ziehenden Spieler. */
export type PlayerId = 1 | 2;

/** Eine einzelne Spielkarte. */
export interface Card {
  id: CardId;
  symbol: CardSymbol;
  isFlipped: boolean;
  isMatched: boolean;
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
export type PlayerColor = "orange" | "blue";

/** Wählbare Spielfeldgröße (Spalten × Zeilen der Beschreibung nach). */
export type BoardSize = "4x4" | "4x6" | "6x6";

/** Kennung einer der optischen Theme-Varianten. */
export type ThemeId = "v1" | "v2" | "v3" | "v4";

/** Vom Nutzer getroffene Auswahl vor Spielbeginn. */
export interface GameSettings {
  playerColor: PlayerColor;
  boardSize: BoardSize;
  theme: ThemeId;
}
