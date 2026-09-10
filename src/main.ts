/**
 * Einstiegspunkt: initialisiert das Memory-Spiel und verbindet UI mit Logik.
 */

import "./styles/main.scss";

import { Game } from "./core/game";
import { loadSettings, saveSettings } from "./core/settings-store";
import {
  BOARD_SIZES,
  CONTAINER_ID,
  EXIT_GAME_BUTTON_ID,
  FLIP_BACK_DELAY_MS,
  GAME_PAGE_ID,
  PLAY_BUTTON_ID,
  SETTINGS_CONTAINER_ID,
  SETTINGS_PAGE_ID,
} from "./config/settings";
import { bindBoardEvents } from "./ui/events";
import { requireElement } from "./ui/dom";
import { mountGame, syncGame } from "./ui/game-view";
import { bindNavButton, showPage } from "./ui/navigation";
import { bindSettingsEvents, renderSettings } from "./ui/settings";
import { applySettings } from "./ui/theme";
import type { CardId, GameSettings } from "./types";

const CONTENT: HTMLElement = requireElement(CONTAINER_ID);
const SETTINGS_ROOT: HTMLElement = requireElement(SETTINGS_CONTAINER_ID);

let settings: GameSettings = loadSettings();
let game: Game | undefined;
let boardMounted: boolean = false;

/** Zeichnet den aktuellen Spielzustand: einmal aufbauen, danach nur angleichen. */
function draw(): void {
  if (game === undefined) {
    return;
  }
  if (boardMounted) {
    syncGame(CONTENT, game, settings);
  } else {
    mountGame(CONTENT, game, settings);
    boardMounted = true;
  }
}

/** Zeichnet das Einstellungsformular mit der aktuellen Auswahl. */
function drawSettings(): void {
  SETTINGS_ROOT.innerHTML = renderSettings(settings);
}

/** Übernimmt eine geänderte Auswahl: speichern, Theme anwenden, neu zeichnen. */
function updateSettings(next: GameSettings): void {
  settings = next;
  saveSettings(next);
  applySettings(next);
  drawSettings();
}

/** Startet eine Partie mit der gewählten Spielfeldgröße. */
function startGame(): void {
  game = new Game(BOARD_SIZES[settings.boardSize].pairs);
  boardMounted = false;
  showPage(GAME_PAGE_ID);
  draw();
}

/** Verlässt das laufende Spiel und kehrt zu den Einstellungen zurück. */
function exitGame(): void {
  game = undefined;
  boardMounted = false;
  showPage(SETTINGS_PAGE_ID);
}

/** Wertet einen abgeschlossenen Zug nach kurzer Verzögerung aus. */
function scheduleTurnResolution(): void {
  window.setTimeout((): void => {
    game?.resolveTurn();
    draw();
  }, FLIP_BACK_DELAY_MS);
}

/** Reagiert auf den Klick auf eine Karte. */
function handleCardClick(id: CardId): void {
  if (game === undefined || game.hasPendingTurn() || !game.flip(id)) {
    return;
  }

  draw();
  if (game.hasPendingTurn()) {
    scheduleTurnResolution();
  }
}

/** Delegierter Klick-Handler für den Exit-Button der Spielleiste. */
function bindExitButton(): void {
  CONTENT.addEventListener("click", (event: MouseEvent): void => {
    const target: EventTarget | null = event.target;
    if (target instanceof HTMLElement && target.closest(`#${EXIT_GAME_BUTTON_ID}`)) {
      exitGame();
    }
  });
}

/** Baut die Ansichten auf und registriert die Ereignisse. */
function init(): void {
  applySettings(settings);
  drawSettings();
  bindNavButton(PLAY_BUTTON_ID, SETTINGS_PAGE_ID);
  bindSettingsEvents(SETTINGS_ROOT, (): GameSettings => settings, updateSettings, startGame);
  bindBoardEvents(CONTENT, handleCardClick);
  bindExitButton();
}

init();
