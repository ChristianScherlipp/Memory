/**
 * Erzeugt das HTML-Markup für Spielbrett und Karten.
 * Der gesamte HTML-String-Aufbau ist hier gebündelt.
 */

import {
  CARD_IMAGE_BASE_PATH,
  THEME_IMAGE_DIRS,
} from "../config/settings";
import type { BoardSize, Card, GameState, ThemeId } from "../types";

/** Pfad zum Kartenbild eines Symbols in der gewählten Theme-Variante. */
function cardImageSrc(symbol: string, theme: ThemeId): string {
  return `${CARD_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${symbol}.svg`;
}

/** Markup einer einzelnen Karte. */
export function renderCard(card: Card, theme: ThemeId): string {
  const isVisible: boolean = card.isFlipped || card.isMatched;
  const stateClass: string = isVisible ? "card--open" : "card--closed";
  const matchedClass: string = card.isMatched ? " card--matched" : "";
  const face: string = isVisible
    ? `<img class="card__image" src="${cardImageSrc(card.symbol, theme)}" alt="">`
    : "";

  return `
    <button class="card ${stateClass}${matchedClass}" data-card-id="${card.id}" type="button">
      ${face}
    </button>
  `;
}

/** Markup aller Karten des Bretts; `size` steuert die Rasterspalten (CSS). */
export function renderBoard(
  cards: readonly Card[],
  size: BoardSize,
  theme: ThemeId,
): string {
  const cardsMarkup: string = cards
    .map((card: Card): string => renderCard(card, theme))
    .join("");
  return `<div class="board" data-size="${size}">${cardsMarkup}</div>`;
}

/** Markup der Statuszeile (Züge, gefundene Paare). */
export function renderStatus(state: GameState): string {
  return `
    <p class="status">
      Züge: ${state.moves} · Paare: ${state.matchedPairs}
    </p>
  `;
}

/** Vollständiges Markup der Spielansicht. */
export function renderGame(
  state: GameState,
  size: BoardSize,
  theme: ThemeId,
): string {
  return `
    ${renderStatus(state)}
    ${renderBoard(state.cards, size, theme)}
  `;
}
