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
}
