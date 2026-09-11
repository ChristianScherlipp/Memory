/**
 * Erzeugt das Markup der Rekordliste: beste Zugzahl und Zeit je Spielfeldgröße.
 */

import type { RecordsByBoardSize } from "../core/records-store";
import {
  BOARD_SIZES,
  CARDS_PER_PAIR,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from "../config/settings";
import type { BoardSize, RecordEntry } from "../types";

/** Reihenfolge der Spielfeldgrößen in der Anzeige. */
const BOARD_SIZE_ORDER: readonly BoardSize[] = ["4x4", "4x6", "6x6"];

/** Beschriftung einer Spielfeldgröße als Kartenanzahl ("16 cards"). */
function cardCountLabel(size: BoardSize): string {
  return `${BOARD_SIZES[size].pairs * CARDS_PER_PAIR} cards`;
}

/** Rekordzeit als "M:SS" formatiert. */
function formatTime(timeMs: number): string {
  const totalSeconds: number = Math.round(timeMs / MS_PER_SECOND);
  const minutes: number = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds: number = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Markup des Ergebnisteils einer Zeile: Bestleistung oder Leerzustand. */
function renderResult(entry: RecordEntry | undefined): string {
  if (entry === undefined) {
    return `<span class="records__empty">No round played yet</span>`;
  }
  return `<span class="records__value">${entry.moves} moves · ${formatTime(entry.timeMs)}</span>`;
}

/** Markup einer einzelnen Zeile: Spielfeldgröße plus Bestleistung oder Leerzustand. */
function renderEntry(size: BoardSize, entry: RecordEntry | undefined): string {
  return `
    <li class="records__row">
      <span class="records__label">${cardCountLabel(size)}</span>
      ${renderResult(entry)}
    </li>
  `;
}

/** Vollständiges Markup der Rekordliste. */
export function renderRecords(records: RecordsByBoardSize): string {
  const rows: string = BOARD_SIZE_ORDER
    .map((size: BoardSize): string => renderEntry(size, records[size]))
    .join("");
  return `<ul class="records">${rows}</ul>`;
}
