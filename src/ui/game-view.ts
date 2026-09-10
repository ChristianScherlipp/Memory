/**
 * Bindeglied zwischen Spielzustand und DOM.
 * Zeichnet das Brett einmal und aktualisiert danach nur die betroffenen
 * Elemente – so bleibt die Flip-Animation der Karten erhalten.
 */

import { playerHex, renderGame, renderGameBar, renderGameEnd } from "./render";
import type { Game } from "../core/game";
import type {
  Card,
  GameOutcome,
  GameSettings,
  GameState,
} from "../types";

/** Baut die komplette Spielansicht neu auf (bei Spielstart). */
export function mountGame(
  root: HTMLElement,
  game: Game,
  settings: GameSettings,
): void {
  root.innerHTML = renderGame(game.getState(), settings, game.getWinner());
}

/** Baut den End-Screen zum ermittelten Ausgang der Partie auf. */
export function mountGameEnd(
  root: HTMLElement,
  outcome: GameOutcome,
  game: Game,
  settings: GameSettings,
): void {
  root.innerHTML = renderGameEnd(outcome, game.getState(), settings);
}

/** Setzt die Karten-Klassen passend zum Zustand (Flip / Treffer). */
function syncCards(root: HTMLElement, cards: readonly Card[]): void {
  for (const card of cards) {
    const element: HTMLElement | null = root.querySelector(
      `.card[data-card-id="${card.id}"]`,
    );
    element?.classList.toggle("card--open", card.isFlipped || card.isMatched);
    element?.classList.toggle("card--matched", card.isMatched);
  }
}

/** Zeichnet Spielleiste neu und übernimmt die Farbe des Spielers am Zug. */
function syncBar(
  root: HTMLElement,
  state: GameState,
  settings: GameSettings,
  game: Game,
): void {
  const bar: HTMLElement | null = root.querySelector(".game-bar");
  if (bar !== null) {
    bar.outerHTML = renderGameBar(state, settings, game.getWinner());
  }
  const board: HTMLElement | null = root.querySelector(".board");
  board?.style.setProperty(
    "--color-player",
    playerHex(state.currentPlayer, settings),
  );
}

/** Aktualisiert Karten und Spielleiste nach einer Zustandsänderung. */
export function syncGame(
  root: HTMLElement,
  game: Game,
  settings: GameSettings,
): void {
  const state: GameState = game.getState();
  syncCards(root, state.cards);
  syncBar(root, state, settings, game);
}
