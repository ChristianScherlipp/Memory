/**
 * Einstiegspunkt: initialisiert das Memory-Spiel und verbindet UI mit Logik.
 */

import "./styles/main.scss";

import { Game } from "./core/game";
import { loadRecords, recordResult } from "./core/records-store";
import { isCompleteSettings, loadSettings, saveSettings } from "./core/settings-store";
import {
  BACK_FROM_RECORDS_BUTTON_ID,
  BACK_TO_START_BUTTON_ID,
  BOARD_SIZES,
  CONTAINER_ID,
  END_CONTAINER_ID,
  END_PAGE_ID,
  EXIT_CANCEL_BUTTON_ID,
  EXIT_CONFIRM_BUTTON_ID,
  EXIT_DIALOG_ID,
  EXIT_GAME_BUTTON_ID,
  FLIP_BACK_DELAY_MS,
  GAME_PAGE_ID,
  PLAY_BUTTON_ID,
  RECORDS_CONTAINER_ID,
  RECORDS_PAGE_ID,
  SETTINGS_CONTAINER_ID,
  SETTINGS_PAGE_ID,
  START_PAGE_ID,
  VIEW_RECORDS_BUTTON_ID,
} from "./config/settings";
import { bindBoardEvents } from "./ui/events";
import { requireDialog, requireElement } from "./ui/dom";
import { mountGame, mountGameEnd, syncGame } from "./ui/game-view";
import { bindNavButton, showPage } from "./ui/navigation";
import { renderRecords } from "./ui/records";
import { bindSettingsEvents, renderSettings } from "./ui/settings";
import { applySettings } from "./ui/theme";
import type { BoardSize, CardId, GameOutcome, GameSettings, SettingsDraft } from "./types";

const CONTENT: HTMLElement = requireElement(CONTAINER_ID);
const SETTINGS_ROOT: HTMLElement = requireElement(SETTINGS_CONTAINER_ID);
const END_ROOT: HTMLElement = requireElement(END_CONTAINER_ID);
const RECORDS_ROOT: HTMLElement = requireElement(RECORDS_CONTAINER_ID);
const EXIT_DIALOG: HTMLDialogElement = requireDialog(EXIT_DIALOG_ID);

let settings: SettingsDraft = loadSettings();
/** Vollständige Auswahl, mit der die laufende Partie gestartet wurde. */
let gameSettings: GameSettings | undefined;
let game: Game | undefined;
let boardMounted: boolean = false;
/** Zeitpunkt des ersten Zugs der laufenden Partie (für die Rekordzeit). */
let turnStartedAt: number | undefined;

/** Zeichnet den aktuellen Spielzustand: einmal aufbauen, danach nur angleichen. */
function draw(): void {
  if (game === undefined || gameSettings === undefined) {
    return;
  }
  if (boardMounted) {
    syncGame(CONTENT, game, gameSettings);
  } else {
    mountGame(CONTENT, game, gameSettings);
    boardMounted = true;
  }
}

/** Zeichnet das Einstellungsformular mit der aktuellen Auswahl. */
function drawSettings(): void {
  SETTINGS_ROOT.innerHTML = renderSettings(settings);
}

/** Zeichnet die Rekordliste mit den aktuell gespeicherten Bestleistungen. */
function drawRecords(): void {
  RECORDS_ROOT.innerHTML = renderRecords(loadRecords());
}

/** Übernimmt eine geänderte Auswahl: speichern, Theme anwenden, neu zeichnen. */
function updateSettings(next: SettingsDraft): void {
  settings = next;
  saveSettings(next);
  applySettings(next);
  drawSettings();
}

/** Startet eine Partie mit der gewählten Spielfeldgröße (nur bei vollständiger Auswahl). */
function startGame(): void {
  if (!isCompleteSettings(settings)) {
    return;
  }
  gameSettings = settings;
  game = new Game(BOARD_SIZES[gameSettings.boardSize].pairs, gameSettings.playerCount);
  boardMounted = false;
  turnStartedAt = undefined;
  showPage(GAME_PAGE_ID);
  draw();
}

/** Verlässt das laufende Spiel und kehrt zu den Einstellungen zurück. */
function exitGame(): void {
  game = undefined;
  gameSettings = undefined;
  boardMounted = false;
  showPage(SETTINGS_PAGE_ID);
}

/** Öffnet die Rückfrage, ob das Spiel wirklich verlassen werden soll. */
function askExit(): void {
  EXIT_DIALOG.showModal();
}

/** Bestätigt die Rückfrage: Dialog schließen und Spiel verlassen. */
function confirmExit(): void {
  EXIT_DIALOG.close();
  exitGame();
}

/** Bricht die Rückfrage ab: Dialog schließen, Spiel läuft weiter. */
function cancelExit(): void {
  EXIT_DIALOG.close();
}

/** Kehrt vom End-Screen zur Startseite zurück. */
function backToStart(): void {
  game = undefined;
  gameSettings = undefined;
  boardMounted = false;
  showPage(START_PAGE_ID);
}

/** Speichert das Ergebnis als Rekord, falls es den bisherigen schlägt. */
function trackRecord(boardSize: BoardSize, moves: number): void {
  const timeMs: number = turnStartedAt !== undefined ? Date.now() - turnStartedAt : 0;
  if (recordResult(boardSize, moves, timeMs)) {
    drawRecords();
  }
}

/** Zeigt den End-Screen, sobald die Partie entschieden ist. */
function maybeShowEnd(): void {
  const outcome: GameOutcome | undefined = game?.getOutcome();
  if (game === undefined || outcome === undefined || gameSettings === undefined) {
    return;
  }
  trackRecord(gameSettings.boardSize, game.getState().moves);
  mountGameEnd(END_ROOT, outcome, game, gameSettings);
  showPage(END_PAGE_ID);
}

/** Wertet einen abgeschlossenen Zug nach kurzer Verzögerung aus. */
function scheduleTurnResolution(): void {
  window.setTimeout((): void => {
    game?.resolveTurn();
    draw();
    maybeShowEnd();
  }, FLIP_BACK_DELAY_MS);
}

/** Reagiert auf den Klick auf eine Karte. */
function handleCardClick(id: CardId): void {
  if (game === undefined || game.hasPendingTurn()) {
    return;
  }

  const didFlip: boolean = game.flip(id);
  if (!didFlip) {
    return;
  }
  if (turnStartedAt === undefined) {
    turnStartedAt = Date.now();
  }

  draw();
  if (game.hasPendingTurn()) {
    scheduleTurnResolution();
  }
}

/** Registriert einen delegierten Klick-Handler auf einen Button per ID. */
function bindDelegatedButton(
  root: HTMLElement,
  buttonId: string,
  onClick: () => void,
): void {
  root.addEventListener("click", (event: MouseEvent): void => {
    const target: EventTarget | null = event.target;
    if (target instanceof HTMLElement && target.closest(`#${buttonId}`)) {
      onClick();
    }
  });
}

/** Baut die Ansichten auf und registriert die Ereignisse. */
function init(): void {
  applySettings(settings);
  drawSettings();
  drawRecords();
  bindNavButton(PLAY_BUTTON_ID, SETTINGS_PAGE_ID);
  bindNavButton(VIEW_RECORDS_BUTTON_ID, RECORDS_PAGE_ID);
  bindNavButton(BACK_FROM_RECORDS_BUTTON_ID, START_PAGE_ID);
  bindSettingsEvents(SETTINGS_ROOT, (): SettingsDraft => settings, updateSettings, startGame);
  bindBoardEvents(CONTENT, handleCardClick);
  bindDelegatedButton(CONTENT, EXIT_GAME_BUTTON_ID, askExit);
  bindDelegatedButton(EXIT_DIALOG, EXIT_CONFIRM_BUTTON_ID, confirmExit);
  bindDelegatedButton(EXIT_DIALOG, EXIT_CANCEL_BUTTON_ID, cancelExit);
  bindDelegatedButton(END_ROOT, BACK_TO_START_BUTTON_ID, backToStart);
}

init();
