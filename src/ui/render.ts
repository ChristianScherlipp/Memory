/**
 * Erzeugt das HTML-Markup für Spielbrett und Karten.
 * Der gesamte HTML-String-Aufbau ist hier gebündelt.
 */

import type { Card, GameState } from "../types";

/** Markup einer einzelnen Karte. */
export function renderCard(card: Card): string {
  const isVisible: boolean = card.isFlipped || card.isMatched;
  const stateClass: string = isVisible ? "card--open" : "card--closed";
  const matchedClass: string = card.isMatched ? " card--matched" : "";
  const face: string = isVisible ? card.symbol : "";

  return `
    <button class="card ${stateClass}${matchedClass}" data-card-id="${card.id}" type="button">
      ${face}
    </button>
  `;
}

/** Markup aller Karten des Bretts. */
export function renderBoard(cards: readonly Card[]): string {
  const cardsMarkup: string = cards.map(renderCard).join("");
  return `<div class="board">${cardsMarkup}</div>`;
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
export function renderGame(state: GameState): string {
  return `
    ${renderStatus(state)}
    ${renderBoard(state.cards)}
  `;
}
