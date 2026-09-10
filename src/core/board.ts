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
 * Erzeugt ein vollständig gemischtes Deck mit `pairCount` Kartenpaaren.
 */
export function createDeck(pairCount: number): Card[] {
  const symbols: readonly CardSymbol[] = CARD_SYMBOLS.slice(0, pairCount);
  const pairs: Card[] = symbols.flatMap(createPair);
  return shuffle(pairs);
}
