/**
 * Laden, Prüfen und Speichern der Nutzer-Auswahl (localStorage).
 * Kennt kein Spiel-DOM, nur den Browser-Speicher.
 */

import {
  BOARD_SIZES,
  PLAYER_COLORS,
  PLAYER_COUNTS,
  SETTINGS_STORAGE_KEY,
  THEME_IDS,
} from "../config/settings";
import type {
  BoardSize,
  GameSettings,
  PlayerColor,
  SettingsDraft,
  ThemeId,
} from "../types";

/** Prüft, ob `value` ein bekannter Schlüssel von `allowed` ist. */
function isKnown(value: unknown, allowed: readonly string[]): boolean {
  return typeof value === "string" && allowed.includes(value);
}

/** Liefert `value`, falls es zu `allowed` gehört, sonst `undefined`. */
function normalizeField<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return isKnown(value, allowed) ? (value as T) : undefined;
}

/** Liefert `value`, falls es eine bekannte Zahl aus `allowed` ist, sonst `undefined`. */
function normalizeNumberField<T extends number>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "number" && allowed.includes(value as T) ? (value as T) : undefined;
}

/** Baut aus unbekannten Rohdaten eine gültige Auswahl (unbekannte Felder bleiben offen). */
function normalize(raw: Partial<Record<keyof GameSettings, unknown>>): SettingsDraft {
  return {
    playerColor: normalizeField(raw.playerColor, Object.keys(PLAYER_COLORS) as PlayerColor[]),
    playerCount: normalizeNumberField(raw.playerCount, PLAYER_COUNTS),
    boardSize: normalizeField(raw.boardSize, Object.keys(BOARD_SIZES) as BoardSize[]),
    theme: normalizeField(raw.theme, THEME_IDS),
  };
}

/** Liest die gespeicherte Auswahl; bei Fehler/Unbekanntem bleiben Felder offen. */
export function loadSettings(): SettingsDraft {
  try {
    const stored: string | null = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored === null) {
      return {};
    }
    return normalize(JSON.parse(stored) as Record<string, unknown>);
  } catch {
    return {};
  }
}

/** Speichert die Auswahl; Fehler (z. B. privater Modus) werden ignoriert. */
export function saveSettings(settings: SettingsDraft): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Persistenz ist optional – ohne Speicher läuft das Spiel trotzdem.
  }
}

/** Ob in jeder Kategorie eine Auswahl getroffen wurde (Spiel kann starten). */
export function isCompleteSettings(settings: SettingsDraft): settings is GameSettings {
  return (
    settings.playerColor !== undefined &&
    settings.playerCount !== undefined &&
    settings.boardSize !== undefined &&
    settings.theme !== undefined
  );
}
