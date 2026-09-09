/**
 * Einstiegspunkt: initialisiert das Memory-Spiel und verbindet UI mit Logik.
 */

import "./styles/main.scss";

import { Game } from "./core/game";
import { CONTAINER_ID, FLIP_BACK_DELAY_MS } from "./config/settings";
import { bindBoardEvents } from "./ui/events";
import { requireElement } from "./ui/dom";
import { renderGame } from "./ui/render";
import type { CardId } from "./types";

const CONTENT: HTMLElement = requireElement(CONTAINER_ID);
const GAME: Game = new Game();

/** Zeichnet den aktuellen Spielzustand in den Container. */
function draw(): void {
  CONTENT.innerHTML = renderGame(GAME.getState());
}

/** Wertet einen abgeschlossenen Zug nach kurzer Verzögerung aus. */
function scheduleTurnResolution(): void {
  window.setTimeout((): void => {
    GAME.resolveTurn();
    draw();
  }, FLIP_BACK_DELAY_MS);
}

/** Reagiert auf den Klick auf eine Karte. */
function handleCardClick(id: CardId): void {
  if (GAME.hasPendingTurn() || !GAME.flip(id)) {
    return;
  }

  draw();
  if (GAME.hasPendingTurn()) {
    scheduleTurnResolution();
  }
}

/** Baut die Startansicht auf und registriert die Ereignisse. */
function init(): void {
  bindBoardEvents(CONTENT, handleCardClick);
  draw();
}

init();
