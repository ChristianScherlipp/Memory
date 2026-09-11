/**
 * Erzeugt das HTML-Markup für Spielleiste, Spielbrett und Karten.
 * Der gesamte HTML-String-Aufbau ist hier gebündelt (kein DOM-Zugriff).
 */

import {
  BACK_TO_START_BUTTON_ID,
  CARD_IMAGE_BASE_PATH,
  EXIT_GAME_BUTTON_ID,
  GAME_END_IMAGE_BASE_PATH,
  GAME_ICON_BASE_PATH,
  PLAYER_COLORS,
  THEME_IMAGE_DIRS,
  THEME_WIN_ASSETS,
  assetUrl,
  assignPlayerColors,
  hasThemedFigure,
  playerIds,
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
  return assetUrl(`${CARD_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${symbol}.svg`);
}

/** Farbe eines Spielers: Spieler 1 wählt, die übrigen bekommen die restlichen Farben. */
export function playerColor(player: PlayerId, settings: GameSettings): PlayerColor {
  return assignPlayerColors(settings.playerColor, settings.playerCount)[player];
}

/** Farbe (Hex) eines Spielers: Spieler 1 wählt, Spieler 2 bekommt den Rest. */
export function playerHex(player: PlayerId, settings: GameSettings): string {
  return PLAYER_COLORS[playerColor(player, settings)];
}

/** Großgeschriebenes Farbwort, z. B. "Blue". */
function capitalizedColorWord(color: PlayerColor): string {
  return `${color.charAt(0).toUpperCase()}${color.slice(1)}`;
}

/**
 * Bildquelle einer Spielerfigur je Theme: Variante 1 sowie jede Farbe ohne
 * eigene Theme-Grafik (aktuell Grün/Rot) nutzen das generische, einfarbige
 * `player_icon.svg` (eingefärbt über die Spielerfarbe); Orange/Blau nutzen
 * ab Theme v2 die farbigen Bilder aus dem `game_end`-Ordner des jeweiligen
 * Themes. `v2` (games_theme_cards) hat keine eigenen Spielerbilder und
 * nutzt daher die von `v1` (code_vibes_theme).
 */
function figureSource(
  color: PlayerColor,
  theme: ThemeId,
): { readonly src: string; readonly generic: boolean } {
  if (theme === "v1" || !hasThemedFigure(color)) {
    return { src: assetUrl(`${GAME_ICON_BASE_PATH}/player_icon.svg`), generic: true };
  }
  const sourceTheme: ThemeId = theme === "v2" ? "v1" : theme;
  return { src: endImageSrc(`player_${color}`, sourceTheme), generic: false };
}

/**
 * Markup einer Spielerfigur (Scoreboard-Icon oder großes Sieg-Bild). Das
 * generische Icon ist weiß und wird per CSS-Maske in der Spielerfarbe
 * eingefärbt; Theme-Bilder bringen ihre Farbe bereits mit und werden als
 * normales `<img>` genutzt. `alt` bleibt leer für rein dekorative Nutzung.
 */
function renderPlayerFigure(
  color: PlayerColor,
  theme: ThemeId,
  hex: string,
  className: string,
  alt: string,
): string {
  const figure: { readonly src: string; readonly generic: boolean } = figureSource(color, theme);
  if (!figure.generic) {
    return `<img class="${className}" src="${figure.src}" alt="${alt}">`;
  }
  const label: string = alt === "" ? ` aria-hidden="true"` : ` role="img" aria-label="${alt}"`;
  const style: string = `background-color: ${hex}; -webkit-mask-image: url('${figure.src}'); mask-image: url('${figure.src}')`;
  return `<span class="${className} icon--tinted" style="${style}"${label}></span>`;
}

/** Markup des Spieler-Icons in der Punkteanzeige (dekorativ, rein farblich). */
function renderScoreboardIcon(color: PlayerColor, theme: ThemeId, hex: string): string {
  return renderPlayerFigure(color, theme, hex, "scoreboard__icon", "");
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
  const color: PlayerColor = playerColor(player, settings);
  const hex: string = PLAYER_COLORS[color];
  const icon: string = renderScoreboardIcon(color, settings.theme, hex);
  const label: string = settings.theme === "v1" ? `${capitalizedColorWord(color)} ` : "";
  return `
    <li class="scoreboard__player${activeClass}" style="color: ${hex}">
      ${icon}
      ${label}${state.scores[player]}
    </li>
  `;
}

/** Text unter der Punkteanzeige: wer am Zug ist bzw. das Ergebnis. */
function renderTurnLine(
  state: GameState,
  settings: GameSettings,
  winner: PlayerId | undefined,
): string {
  if (state.status === "won") {
    const text: string =
      winner === undefined ? "Draw!" : `Player ${winner} wins!`;
    return `<p class="game-bar__turn">${text}</p>`;
  }
  const color: PlayerColor = playerColor(state.currentPlayer, settings);
  const hex: string = PLAYER_COLORS[color];
  const icon: string = renderScoreboardIcon(color, settings.theme, hex);
  return `<p class="game-bar__turn">Current player: ${icon}</p>`;
}

/** Markup der Spielleiste: Punktestand, aktueller Spieler, Exit-Button. */
export function renderGameBar(
  state: GameState,
  settings: GameSettings,
  winner: PlayerId | undefined,
): string {
  const players: string = playerIds(settings.playerCount)
    .map((player: PlayerId): string => renderPlayer(player, state, settings))
    .join("");
  return `
    <header class="game-bar">
      <ul class="scoreboard">${players}</ul>
      ${renderTurnLine(state, settings, winner)}
      <button class="button button--exit" type="button" id="${EXIT_GAME_BUTTON_ID}">
        <span class="game-bar__exit-icon" aria-hidden="true"></span>
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
    <div class="game-board__content">
      ${renderBoard(state.cards, settings, turnColor)}
    </div>
  `;
}

/** Pfad zu einem End-Screen-Bild in der gewählten Theme-Variante. */
function endImageSrc(name: string, theme: ThemeId): string {
  return assetUrl(`${GAME_END_IMAGE_BASE_PATH}/${THEME_IMAGE_DIRS[theme]}/${name}.svg`);
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

/** Markup des Sieg-Bilds: Pokal (immer Theme-Bild) oder Spielerfigur (Theme-Bild/generisches Icon). */
function renderWinFigure(settings: GameSettings): string {
  if (THEME_WIN_ASSETS[settings.theme].figure === "trophy") {
    return `<img class="game-end__figure" src="${endImageSrc("winnerpokal", settings.theme)}" alt="Winner's trophy">`;
  }
  const hex: string = playerHex(1, settings);
  const alt: string = `${colorWord(settings.playerColor)} wins`;
  return renderPlayerFigure(settings.playerColor, settings.theme, hex, "game-end__figure", alt);
}

/** Sieg-Ansicht (Spieler 1 hat gewonnen). */
function renderWin(settings: GameSettings): string {
  const confetti: string = THEME_WIN_ASSETS[settings.theme].confetti
    ? `<img class="game-end__confetti" src="${endImageSrc("confetti", settings.theme)}" alt="">`
    : "";
  return `
    ${confetti}
    <p class="game-end__lead">The winner is</p>
    <h1 class="game-end__player">${colorWord(settings.playerColor)}</h1>
    ${renderWinFigure(settings)}
  `;
}

/** Markup der Endstand-Liste aller aktiven Spieler. */
function renderScoreList(state: GameState, settings: GameSettings): string {
  const rows: string = playerIds(settings.playerCount)
    .map((player: PlayerId): string =>
      `<li>${colorWord(playerColor(player, settings))}: ${state.scores[player]}</li>`,
    )
    .join("");
  return `<ul class="game-end__scores">${rows}</ul>`;
}

/** Game-Over-Ansicht (ein anderer Spieler als Spieler 1 hat gewonnen). */
function renderGameOver(winner: PlayerId, state: GameState, settings: GameSettings): string {
  return `
    <h1 class="game-end__title game-end__title--back">game over</h1>
    <p class="game-end__lead">${colorWord(playerColor(winner, settings))} wins</p>
    <p class="game-end__lead">final score</p>
    ${renderScoreList(state, settings)}
  `;
}

/** Unentschieden-Ansicht. */
function renderDraw(state: GameState, settings: GameSettings): string {
  return `
    <p class="game-end__lead">it's a</p>
    <h1 class="game-end__title game-end__title--back"><strong>DRAW</strong></h1>
    <img class="game-end__figure" src="${endImageSrc("draw", settings.theme)}" alt="It's a draw">
    ${renderScoreList(state, settings)}
  `;
}

/** Wählt das Markup des End-Screen-Inhalts zum jeweiligen Ausgang. */
function renderGameEndBody(
  outcome: GameOutcome,
  state: GameState,
  settings: GameSettings,
): string {
  if (outcome.kind === "draw") {
    return renderDraw(state, settings);
  }
  return outcome.winner === 1
    ? renderWin(settings)
    : renderGameOver(outcome.winner, state, settings);
}

/** CSS-Modifier für den End-Screen, abgeleitet vom Ausgang. */
function outcomeModifier(outcome: GameOutcome): string {
  return outcome.kind === "draw" ? "draw" : `win-${outcome.winner}`;
}

/** Vollständiges Markup des End-Screens je nach Ausgang der Partie. */
export function renderGameEnd(
  outcome: GameOutcome,
  state: GameState,
  settings: GameSettings,
): string {
  const body: string = renderGameEndBody(outcome, state, settings);
  return `
    <div class="game-end game-end--${outcomeModifier(outcome)}">
      ${body}
      ${renderBackButton()}
    </div>
  `;
}
