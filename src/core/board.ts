/**
 * Erzeugen und Aufbereiten des Kartendecks. Kennt kein DOM.
 */

import { CARD_SYMBOLS } from "../config/settings";
import { shuffle } from "../utils/shuffle";
import type { Card, CardSymbol } from "../types";

/**
 * Baut aus einem Symbol zwei zugedeckte, noch nicht gematchte Karten.
 */
function createPair(symbol: CardSymbol, pairIndex: number): Card[] {
  const base = { symbol, isFlipped: false, isMatched: false };
  return [
    { id: pairIndex * 2, ...base },
    { id: pairIndex * 2 + 1, ...base },
  ];
}

/**
 * Erzeugt ein vollständig gemischtes Deck aus allen konfigurierten Symbolen.
 */
export function createDeck(): Card[] {
  const pairs: Card[] = CARD_SYMBOLS.flatMap(createPair);
  return shuffle(pairs);
}
