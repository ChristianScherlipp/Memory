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
  THEME_WIN_ASSETS,
  otherPlayerColor,
} from "../config/settings";
import type {
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

/** Sichtbarer alt-Text einer aufgedeckten Karte ("Motif 3"). */
function cardFaceAlt(card: Card): string {
  if (!card.isFlipped && !card.isMatched) {
    return "";
  }
  return `Motif ${card.symbol.replace(/\D/g, "")}`;
}

/**
 * Inline-Style, der die Kartenumrandung auf die Farbe des Spielers festhält,
 * der das Paar aufgedeckt hat. Leer, solange die Karte nicht gematcht ist.
 */
function matchBorderStyle(card: Card, settings: GameSettings): string {
  if (!card.isMatched || card.matchedBy === undefined) {
    return "";
  }
  return ` style="--card-border: ${playerHex(card.matchedBy, settings)}"`;
}

/** Markup einer einzelnen Karte mit Vorder- und Rückseite (für den Flip). */
export function renderCard(card: Card, settings: GameSettings): string {
  const openClass: string =
    card.isFlipped || card.isMatched ? " card--open" : "";
  const matchedClass: string = card.isMatched ? " card--matched" : "";
  const lock: string = matchBorderStyle(card, settings);
  return `
    <button class="card${openClass}${matchedClass}" data-card-id="${card.id}" type="button"${lock}>
      <span class="card__inner">
        <span class="card__face card__face--back"></span>
        <span class="card__face card__face--front">
          <img class="card__image" src="${cardImageSrc(card.symbol, settings.theme)}" alt="${cardFaceAlt(card)}">
        </span>
      </span>
    </button>
  `;
}

/** Markup aller Karten des Bretts; `boardSize` steuert die Rasterspalten (CSS). */
export function renderBoard(
  cards: readonly Card[],
  settings: GameSettings,
  turnColor: string,
): string {
  const cardsMarkup: string = cards
    .map((card: Card): string => renderCard(card, settings))
    .join("");
  return `<div class="board" data-size="${settings.boardSize}" style="--color-player: ${turnColor}">${cardsMarkup}</div>`;
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
    <li class="scoreboard__player${activeClass}" style="color: ${hex}">
      <span class="scoreboard__swatch" style="background: ${hex}"></span>
      Player ${player}: ${state.scores[player]}
    </li>
  `;
}

/** Text unter der Punkteanzeige: wer am Zug ist bzw. das Ergebnis. */
function renderTurnLine(state: GameState, winner: PlayerId | undefined): string {
  if (state.status === "won") {
    const text: string =
      winner === undefined ? "Draw!" : `Player ${winner} wins!`;
    return `<p class="game-bar__turn">${text}</p>`;
  }
  return `<p class="game-bar__turn">Player ${state.currentPlayer}'s turn</p>`;
}

/** Markup der Spielleiste: Punktestand, aktueller Spieler, Exit-Button. */
export function renderGameBar(
  state: GameState,
  settings: GameSettings,
  winner: PlayerId | undefined,
): string {
  return `
    <header class="game-bar">
      <ul class="scoreboard">
        ${renderPlayer(1, state, settings)}
        ${renderPlayer(2, state, settings)}
      </ul>
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
    ${renderBoard(state.cards, settings, turnColor)}
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

/** Dateiname und alt-Text des Sieg-Bilds je nach Theme. */
function winFigure(settings: GameSettings): { name: string; alt: string } {
  if (THEME_WIN_ASSETS[settings.theme].figure === "trophy") {
    return { name: "winnerpokal", alt: "Winner's trophy" };
  }
  return {
    name: `player_${settings.playerColor}`,
    alt: `${colorWord(settings.playerColor)} wins`,
  };
}

/** Sieg-Ansicht (Spieler 1 hat gewonnen). */
function renderWin(settings: GameSettings): string {
  const figure: { name: string; alt: string } = winFigure(settings);
  const confetti: string = THEME_WIN_ASSETS[settings.theme].confetti
    ? `<img class="game-end__confetti" src="${endImageSrc("confetti", settings.theme)}" alt="">`
    : "";
  return `
    ${confetti}
    <p class="game-end__lead">The winner is</p>
    <h1 class="game-end__player">${colorWord(settings.playerColor)}</h1>
    <img class="game-end__figure" src="${endImageSrc(figure.name, settings.theme)}" alt="${figure.alt}">
  `;
}

/** Game-Over-Ansicht (Spieler 2 hat gewonnen). */
function renderGameOver(state: GameState, settings: GameSettings): string {
  const one: PlayerColor = settings.playerColor;
  const two: PlayerColor = otherPlayerColor(one);
  return `
    <h1 class="game-end__title game-end__title--back">game over</h1>
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
    <h1 class="game-end__title game-end__title--back"><strong>DRAW</strong></h1>
    <img class="game-end__figure" src="${endImageSrc("draw", settings.theme)}" alt="It's a draw">
  `;
}

/** Wählt das Markup des End-Screen-Inhalts zum jeweiligen Ausgang. */
function renderGameEndBody(
  outcome: GameOutcome,
  state: GameState,
  settings: GameSettings,
): string {
  switch (outcome) {
    case "player-1-wins":
      return renderWin(settings);
    case "player-2-wins":
      return renderGameOver(state, settings);
    case "draw":
      return renderDraw(settings);
  }
}

/** Vollständiges Markup des End-Screens je nach Ausgang der Partie. */
export function renderGameEnd(
  outcome: GameOutcome,
  state: GameState,
  settings: GameSettings,
): string {
  const body: string = renderGameEndBody(outcome, state, settings);
  return `
    <div class="game-end game-end--${outcome}">
      ${body}
      ${renderBackButton()}
    </div>
  `;
}
