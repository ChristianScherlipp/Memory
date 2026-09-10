/**
 * Erzeugen und Aufbereiten des Kartendecks. Kennt kein DOM.
 */

import { CARD_SYMBOLS, CARDS_PER_PAIR } from "../config/settings";
import { shuffle } from "../utils/shuffle";
import type { Card, CardSymbol } from "../types";

/**
 * Baut aus einem Symbol zwei zugedeckte, noch nicht gematchte Karten.
 */
function createPair(symbol: CardSymbol, pairIndex: number): Card[] {
  const base: Omit<Card, "id"> = { symbol, isFlipped: false, isMatched: false };
  const firstId: number = pairIndex * CARDS_PER_PAIR;
  return [
    { id: firstId, ...base },
    { id: firstId + 1, ...base },
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
