/**
 * Überträgt die Nutzer-Auswahl als Data-Attribute auf das <html>-Element.
 * Die konkreten Farben/Spalten setzt daraufhin das CSS.
 */

import { DEFAULT_SETTINGS } from "../config/settings";
import type { SettingsDraft } from "../types";

/**
 * Setzt `data-theme` und `data-player` auf dem Wurzelelement – rein optisch,
 * daher mit Fallback auf die Standardwerte, solange noch keine Auswahl steht.
 */
export function applySettings(settings: SettingsDraft): void {
  const root: HTMLElement = document.documentElement;
  root.dataset.theme = settings.theme ?? DEFAULT_SETTINGS.theme;
  root.dataset.player = settings.playerColor ?? DEFAULT_SETTINGS.playerColor;
}
