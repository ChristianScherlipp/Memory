/**
 * Zentrale Konfigurationswerte des Spiels.
 * Keine Magic Numbers im übrigen Code – alles hier benennen.
 */

import type { CardSymbol } from "../types";

/** ID des DOM-Containers, in den das Spielbrett gerendert wird. */
export const CONTAINER_ID: string = "game-board";

/** Verfügbare Kartensymbole (je eines pro Paar). */
export const CARD_SYMBOLS: readonly CardSymbol[] = [
  "🍎",
  "🚀",
  "🌵",
  "🎲",
  "🐙",
  "🎸",
  "⚓",
  "🍄",
];

/** Anzahl der Paare pro Partie. */
export const PAIR_COUNT: number = CARD_SYMBOLS.length;

/** Verzögerung (ms), bevor ein nicht passendes Paar wieder zugedeckt wird. */
export const FLIP_BACK_DELAY_MS: number = 900;
