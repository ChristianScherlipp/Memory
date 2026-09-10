/**
 * Erzeugt das HTML-Markup für Spielleiste, Spielbrett und Karten.
 * Der gesamte HTML-String-Aufbau ist hier gebündelt (kein DOM-Zugriff).
 */

import {
  BACK_TO_START_BUTTON_ID,
  CARD_IMAGE_BASE_PATH,
  EXIT_GAME_BUTTON_ID,
  GAME_END_IMAGE_BASE_PATH,
  PLAYER_COLORS,
  THEME_IMAGE_DIRS,
  otherPlayerColor,
} from "../config/settings";
import type {
  BoardSize,
  Card,
  GameOutcome,
  GameSettings,
  GameState,
  PlayerColor,
  PlayerId,
  ThemeId,
} from "../types";

/** Pfad zum Kartenbild eines Symbols in der gewählten Theme-Variante. */
function cardImageSrc(symbol: string, theme: ThemeId): string {
  return `${CARD_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${symbol}.svg`;
}

/** Farbe (Hex) eines Spielers: Spieler 1 wählt, Spieler 2 bekommt den Rest. */
export function playerHex(player: PlayerId, settings: GameSettings): string {
  const color: PlayerColor =
    player === 1 ? settings.playerColor : otherPlayerColor(settings.playerColor);
  return PLAYER_COLORS[color];
}

/** Markup einer einzelnen Karte mit Vorder- und Rückseite (für den Flip). */
export function renderCard(card: Card, theme: ThemeId): string {
  const openClass: string =
    card.isFlipped || card.isMatched ? " card--open" : "";
  const matchedClass: string = card.isMatched ? " card--matched" : "";
  return `
    <button class="card${openClass}${matchedClass}" data-card-id="${card.id}" type="button">
      <span class="card__inner">
        <span class="card__face card__face--back"></span>
        <span class="card__face card__face--front">
          <img class="card__image" src="${cardImageSrc(card.symbol, theme)}" alt="">
        </span>
      </span>
    </button>
  `;
}

/** Markup aller Karten des Bretts; `size` steuert die Rasterspalten (CSS). */
export function renderBoard(
  cards: readonly Card[],
  size: BoardSize,
  theme: ThemeId,
  turnColor: string,
): string {
  const cardsMarkup: string = cards
    .map((card: Card): string => renderCard(card, theme))
    .join("");
  return `<div class="board" data-size="${size}" style="--color-player: ${turnColor}">${cardsMarkup}</div>`;
}

/** Markup einer Spieler-Kachel in der Punkteanzeige. */
function renderPlayer(
  player: PlayerId,
  state: GameState,
  settings: GameSettings,
): string {
  const active: boolean = state.status !== "won" && state.currentPlayer === player;
  const activeClass: string = active ? " scoreboard__player--active" : "";
  const hex: string = playerHex(player, settings);
  return `
    <span class="scoreboard__player${activeClass}" style="color: ${hex}">
      <span class="scoreboard__swatch" style="background: ${hex}"></span>
      Spieler ${player}: ${state.scores[player]}
    </span>
  `;
}

/** Text unter der Punkteanzeige: wer am Zug ist bzw. das Ergebnis. */
function renderTurnLine(state: GameState, winner: PlayerId | undefined): string {
  if (state.status === "won") {
    const text: string =
      winner === undefined ? "Unentschieden!" : `Spieler ${winner} gewinnt!`;
    return `<p class="game-bar__turn">${text}</p>`;
  }
  return `<p class="game-bar__turn">Am Zug: Spieler ${state.currentPlayer}</p>`;
}

/** Markup der Spielleiste: Punktestand, aktueller Spieler, Exit-Button. */
export function renderGameBar(
  state: GameState,
  settings: GameSettings,
  winner: PlayerId | undefined,
): string {
  return `
    <header class="game-bar">
      <div class="scoreboard">
        ${renderPlayer(1, state, settings)}
        ${renderPlayer(2, state, settings)}
      </div>
      ${renderTurnLine(state, winner)}
      <button class="button button--exit" type="button" id="${EXIT_GAME_BUTTON_ID}">
        Exit Game
      </button>
    </header>
  `;
}

/** Vollständiges Markup der Spielansicht. */
export function renderGame(
  state: GameState,
  settings: GameSettings,
  winner: PlayerId | undefined,
): string {
  const turnColor: string = playerHex(state.currentPlayer, settings);
  return `
    ${renderGameBar(state, settings, winner)}
    ${renderBoard(state.cards, settings.boardSize, settings.theme, turnColor)}
  `;
}

/** Pfad zu einem End-Screen-Bild in der gewählten Theme-Variante. */
function endImageSrc(name: string, theme: ThemeId): string {
  return `${GAME_END_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${name}.svg`;
}

/** Beschriftung eines Spielers, z. B. "orange player". */
function colorWord(color: PlayerColor): string {
  return `${color} player`;
}

/** Zurück-zur-Startseite-Button des End-Screens. */
function renderBackButton(): string {
  return `
    <button class="button button--back" type="button" id="${BACK_TO_START_BUTTON_ID}">
      Back to start
    </button>
  `;
}

/** Sieg-Ansicht (Spieler 1 hat gewonnen). */
function renderWin(settings: GameSettings): string {
  const color: PlayerColor = settings.playerColor;
  return `
    <img class="game-end__confetti" src="${endImageSrc("confetti", settings.theme)}" alt="">
    <p class="game-end__lead">The winner is</p>
    <p class="game-end__player">${colorWord(color)}</p>
    <img class="game-end__figure" src="${endImageSrc(`player_${color}`, settings.theme)}" alt="">
  `;
}

/** Game-Over-Ansicht (Spieler 2 hat gewonnen). */
function renderGameOver(state: GameState, settings: GameSettings): string {
  const one: PlayerColor = settings.playerColor;
  const two: PlayerColor = otherPlayerColor(one);
  return `
    <p class="game-end__title game-end__title--back">game over</p>
    <p class="game-end__lead">final score</p>
    <ul class="game-end__scores">
      <li>${colorWord(one)}: ${state.scores[1]}</li>
      <li>${colorWord(two)}: ${state.scores[2]}</li>
    </ul>
  `;
}

/** Unentschieden-Ansicht. */
function renderDraw(settings: GameSettings): string {
  return `
    <p class="game-end__lead">it's a</p>
    <p class="game-end__title game-end__title--back">DRAW</p>
    <img class="game-end__figure" src="${endImageSrc("draw", settings.theme)}" alt="">
  `;
}

/** Vollständiges Markup des End-Screens je nach Ausgang der Partie. */
export function renderGameEnd(
  outcome: GameOutcome,
  state: GameState,
  settings: GameSettings,
): string {
  const body: string =
    outcome === "player-1-wins"
      ? renderWin(settings)
      : outcome === "draw"
        ? renderDraw(settings)
        : renderGameOver(state, settings);
  return `
    <div class="game-end game-end--${outcome}">
      ${body}
      ${renderBackButton()}
    </div>
  `;
}
