/**
 * Laden, Prüfen und Speichern der Nutzer-Auswahl (localStorage).
 * Kennt kein Spiel-DOM, nur den Browser-Speicher.
 */

import {
  BOARD_SIZES,
  DEFAULT_SETTINGS,
  PLAYER_COLORS,
  SETTINGS_STORAGE_KEY,
  THEME_IDS,
} from "../config/settings";
import type {
  BoardSize,
  GameSettings,
  PlayerColor,
  ThemeId,
} from "../types";

/** Prüft, ob `value` ein bekannter Schlüssel von `allowed` ist. */
function isKnown(value: unknown, allowed: readonly string[]): boolean {
  return typeof value === "string" && allowed.includes(value);
}

/** Baut aus unbekannten Rohdaten eine gültige `GameSettings` (Feld-Fallback). */
function normalize(raw: Partial<Record<keyof GameSettings, unknown>>): GameSettings {
  const playerColor: unknown = raw.playerColor;
  const boardSize: unknown = raw.boardSize;
  const theme: unknown = raw.theme;
  return {
    playerColor: isKnown(playerColor, Object.keys(PLAYER_COLORS))
      ? (playerColor as PlayerColor)
      : DEFAULT_SETTINGS.playerColor,
    boardSize: isKnown(boardSize, Object.keys(BOARD_SIZES))
      ? (boardSize as BoardSize)
      : DEFAULT_SETTINGS.boardSize,
    theme: isKnown(theme, THEME_IDS)
      ? (theme as ThemeId)
      : DEFAULT_SETTINGS.theme,
  };
}

/** Liest die gespeicherte Auswahl; bei Fehler/Unbekanntem die Standardwerte. */
export function loadSettings(): GameSettings {
  try {
    const stored: string | null = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored === null) {
      return { ...DEFAULT_SETTINGS };
    }
    return normalize(JSON.parse(stored) as Record<string, unknown>);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Speichert die Auswahl; Fehler (z. B. privater Modus) werden ignoriert. */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Persistenz ist optional – ohne Speicher läuft das Spiel trotzdem.
  }
}
